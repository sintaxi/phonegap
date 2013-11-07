// Copyright 2012 Intel Corporation
//
// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

// For some reason, the mp4 files we generate using MF topologies show incorrect durations if several tracks are used

// Pending a root cause explanation for this, work around the problem by overwriting the values in the duration field
// in the movie header

// The mp4 files are structured as a collection of 'atoms' starting with two fields:

// size (4 bytes)
// type (4 bytes)

// Among the top level atoms, we're interested in the the movie (moov) atom, which should contain other atoms,
// including the movie header

// movie duration should be the duration of the longest track
// time scale is the number of time units per second
// time in seconds since midnight, January 1, 1904, UTC

// All integer values are stored in big endian form (most significant byte first)

// Each track (track) contains an header (tkhd)

#define WIN32_LEAN_AND_MEAN
#include <windows.h>

// Couple of big-endian read/write macros
#define READ_BE4(addr)	(*(addr) << 24) | (*(addr+1) << 16) | (*(addr+2) << 8) | *(addr+3)
#define WRITE_BE4(addr, val) *(addr) = val >> 24; *(addr+1) = (BYTE) (val >> 16); *(addr+2) = (BYTE) (val >> 8); *(addr+3) = (BYTE) val

// The implementation is limited to 32 bits mp4 files for now as Media Foundation does not generate larger files

void locate_moov(BYTE* start, DWORD size, BYTE** moov_start, DWORD* moov_size)
{
	// Check top level atoms

	DWORD cursor = 0;
	DWORD atom_size;
	DWORD atom_type;

	while (cursor + 8 < size)
	{
		atom_size = READ_BE4(start + cursor);
		atom_type = READ_BE4(start + 4 + cursor);

		if (atom_type == 'moov')
		{
			*moov_start = start + cursor;
			*moov_size = atom_size;
			return;
		}
		 
		if (atom_size < 8)
			return;
		
		cursor += atom_size;
	}
}

void locate_mvhd(BYTE* start, DWORD size, BYTE** mvhd_start, DWORD* mvhd_size)
{
	// Check atoms within moov, looking for mvhd

	DWORD cursor = 0;
	DWORD atom_size;
	DWORD atom_type;

	while (cursor + 8 < size)
	{
		atom_size = READ_BE4(start + cursor);
		atom_type = READ_BE4(start + 4 + cursor);

		if (atom_type == 'mvhd')
		{
			*mvhd_start = start + cursor;
			*mvhd_size = atom_size;
			return;
		}

		if (atom_size < 8)
			return;

		cursor += atom_size;
	}
}


void fix_mp4_duration (wchar_t* file_name, LONGLONG duration)
{
	HANDLE file_handle;
	HANDLE mapping_handle;
	
	DWORD file_size;
	BYTE* mapping_addr;
	BYTE* moov_addr = 0;
	BYTE* mvhd_addr = 0;
	DWORD moov_size;
	DWORD mvhd_size;
	DWORD time_scale;
	DWORD fixed_duration;
	DWORD time_ratio;
	
	// Open file for read & write
	file_handle = CreateFile(file_name, GENERIC_READ | GENERIC_WRITE, 0, 0, OPEN_EXISTING, 0, 0);

	if (file_handle == INVALID_HANDLE_VALUE)
		return;

	file_size = GetFileSize(file_handle, 0);
		
	// Create mapping
	mapping_handle = CreateFileMapping(file_handle, 0, PAGE_READWRITE, 0, 0, 0);

	if (mapping_handle == NULL)
		goto close_file;

	// Create view
	mapping_addr = (BYTE*) MapViewOfFile(mapping_handle, FILE_MAP_WRITE, 0, 0, file_size);
	
	// Locate top level movie atom
	locate_moov(mapping_addr, file_size, &moov_addr, &moov_size);

	if (moov_addr)
	{
		// Inside it, locate movie header
		locate_mvhd(moov_addr + 8, moov_size, &mvhd_addr, &mvhd_size);

		if (mvhd_addr)
		{
			// The movie header (mvhd) atom has the following fields:
			// version (1 byte)
			// flags (3 bytes)
			// creation time, modification time, time scale, duration (4 bytes each)

			time_scale = READ_BE4(mvhd_addr + 4 + 4 + 1 + 3 + 4 + 4);
			
			if (time_scale)
			{
					time_ratio = (DWORD) (10000000L / time_scale);	// Duration is passed as a number of 100 ns units - there are 10 million ticks per sec
					fixed_duration = (DWORD) (duration/time_ratio);

					WRITE_BE4(mvhd_addr + 4 + 4 + 1 + 3 + 4 + 4 + 4, fixed_duration);
			}
		}
	}

	if (mapping_addr)
		UnmapViewOfFile(mapping_addr);

	CloseHandle(mapping_handle);

close_file:

	CloseHandle(file_handle);
}



