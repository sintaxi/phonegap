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

#include <windows.h>
#include <gdiplus.h>

#include "jpeg.h"

#pragma comment(lib, "gdiplus.lib")

using namespace Gdiplus;


int GetEncoderClsid(const WCHAR* format, CLSID* pClsid)
{
   UINT  num = 0;          // number of image encoders
   UINT  size = 0;         // size of the image encoder array in bytes

   ImageCodecInfo* pImageCodecInfo = NULL;

   GetImageEncodersSize(&num, &size);
   if(size == 0)
      return -1;  // Failure

   pImageCodecInfo = (ImageCodecInfo*)(malloc(size));
   if(pImageCodecInfo == NULL)
      return -1;  // Failure

   GetImageEncoders(num, size, pImageCodecInfo);

   for(UINT j = 0; j < num; ++j)
   {
      if( wcscmp(pImageCodecInfo[j].MimeType, format) == 0 )
      {
         *pClsid = pImageCodecInfo[j].Clsid;
         free(pImageCodecInfo);
         return j;  // Success
      }    
   }

   free(pImageCodecInfo);
   return -1;  // Failure
}


int save_bitmap_as_jpeg (int width, int height, unsigned char* data, unsigned int sample_size, wchar_t* filename, int scan_len)
{
	int success;	
	GdiplusStartupInput gdiplusStartupInput;
	ULONG_PTR gdiplusToken;
	CLSID             encoderClsid;
	EncoderParameters encoderParameters;
	ULONG             quality;
	int row_bytes = (width * 3 +3)/4*4;	// 24 bpp padded format
	Bitmap* image;

	GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);
	
	if (height <= 1 || scan_len >= 0)
	{
		image = new Bitmap(width, height, row_bytes, PixelFormat24bppRGB, data);
	}
	else
	{
		image = new Bitmap(width, height, -row_bytes, PixelFormat24bppRGB, data + row_bytes*(height-1));
	}

	// If we can find the JPEG encoder
	if (GetEncoderClsid(L"image/jpeg", &encoderClsid) != -1)
	{
		// Save the image at JPEG quality level 85

		encoderParameters.Count = 1;
		encoderParameters.Parameter[0].Guid = EncoderQuality;
		encoderParameters.Parameter[0].Type = EncoderParameterValueTypeLong;
		encoderParameters.Parameter[0].NumberOfValues = 1;

		quality = 85;
		encoderParameters.Parameter[0].Value = &quality;
		success = (image->Save(filename, &encoderClsid, &encoderParameters) == Ok);
	}
	else
		success = 0;

	delete image;
	GdiplusShutdown(gdiplusToken);

	return success;
}
