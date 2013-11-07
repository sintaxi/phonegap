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

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
	
#include <mfapi.h>	// Media Foundation
#include <mfidl.h>	// Media session 
#include <evr.h>	// Enhanced Video Renderer
#include <ks.h>			// Required by codecapi.h...
#include <codecapi.h> // H.264 codec profiles
#include <wmcodecdsp.h> // Color converter transform
#include "capture.h"
#include "jpeg.h"	// JPEG compression utility
#include <commctrl.h>	// Toolbar
#include <windowsx.h>	// Common control macros
#include <mferror.h>	// MF_E_NOTACCEPTING and friends
#include "resource.h"
#include <wchar.h>
#include "common.h"
#include "mp4patch.h"

// Workaround for a declaration in the Windows 8 SDK that's mistakenly missing for non C++ files
STDAPI MFCreateCollection(_Out_ IMFCollection **ppIMFCollection);

#pragma comment(lib, "mfuuid.lib")      // Media Foundation UUIDs
#pragma comment(lib, "mfplat.lib")	// MF attributes
#pragma comment(lib, "mf.lib")	// MF topology, session, device enumeration and video renderer
#pragma comment(lib, "wmcodecdspuuid.lib")	// Color converter
#pragma comment(lib, "strmiids.lib") // DirectShow UUIDs, ID_IMFVideoDisplayControl

HWND hCaptureWnd;
HWND hPreviewWnd;
extern HWND hWnd;

#define PHOTO_CAPTURE_TOPO	1	// Video capture + video preview + frame grabber
#define VIDEO_FRAMING_TOPO	2	// Video capture + video preview
#define VIDEO_CAPTURE_TOPO	3	// Video capture + audio capture + video preview + audio capture + h264 + aac + mp4 output 
#define AUDIO_CAPTURE_TOPO	4	// Audio capture + aac + mp4 output
#define AUDIO_PLAYBACK_TOPO	5	// Playing an audio recording from a file

IMFMediaSession*	media_session_if;	// MF session and topology 

IMFVideoDisplayControl* video_display_control_if;	// Video renderer position / snapshot retrieval

IMFMediaType* cam_config_if;	// Video capture device output configuration
IMFMediaType* conv_config_if;	// Color converter encoder output configuration
IMFMediaType* h264_config_if;	// AVC encoder output configuration
IMFMediaType* aac_config_if;	// AAC encoder output configuration

IMFMediaType* mic_config_if;	// Audio capture device output configuration

IMFMediaSource*	video_source_if;	// These need to be shutdown before being released, so keep keep pointers around
IMFMediaSource*	audio_source_if;
IMFMediaSink* media_sink_if;
IMFTransform* video_compr_transform_if;
IMFTransform* audio_compr_transform_if;
IMFTransform* color_transform_if;

BOOL mjpeg_mode;

struct IMFSampleGrabberSinkCallback2 sgsc;	// Sample grabber sink callback, used in photo mode to retrieve video frames


// Video capture settings
UINT64 frame_size;			// Ex: 640:480
UINT64 frame_rate;			// Ex: 30:1
INT32 scan_len;				// Scan line len (negative if scanning happens upwards)

// Flag raised when capturing photos
BOOL grab_first_available_frame = FALSE;

HANDLE session_control_thread;

#define MAX_FILE_NAME_LEN	255	// NUL not included

wchar_t temp_directory_win[MAX_FILE_NAME_LEN + 1];	//	C:\Temp syntax
wchar_t temp_directory_url[MAX_FILE_NAME_LEN + 8];	//	file://C:/Temp syntax
wchar_t last_recorded_file_name_full[MAX_FILE_NAME_LEN+1];	// Full path
wchar_t last_recorded_file_name[MAX_FILE_NAME_LEN+1];		// Name only

LONGLONG start_time;	// Marker used to compute the duration of the last recording

// Note: the MPEG 4 sink is limited to 4 GB

#define VIDEO_BIT_RATE	4000000
#define AUDIO_BIT_RATE	160000


#define ACTION_PHOTO_CAPTURE	0
#define ACTION_VIDEO_FRAMING	1
#define ACTION_VIDEO_CAPTURE	2

int current_action_code;


#define RELEASE(x) { if (x) (x)->lpVtbl->Release(x); }
#define ADDREF(x) {if (x) x->lpVtbl->AddRef(x);}
#define RELEASE_D(x) {if (x) { OutputDebugString(L"Unreleased COM interface: " L ## #x L"\n"); x->lpVtbl->Release(x); }}
#define RELEASE_Z(x) {if (x) { x->lpVtbl->Release(x); x = 0;} }


// @@@ handle removal
#define MAX_DEVICE_NAME_LEN		80	// NUL not included

wchar_t preferred_video_capture_dev[MAX_DEVICE_NAME_LEN+1];
wchar_t preferred_audio_capture_dev[MAX_DEVICE_NAME_LEN+1];
wchar_t preferred_video_encoder[MAX_DEVICE_NAME_LEN+1];
wchar_t preferred_video_resolution[MAX_DEVICE_NAME_LEN+1];
wchar_t preferred_photo_resolution[MAX_DEVICE_NAME_LEN+1];

#define PREF_VIDEO_DEVICE		L"DefaultVideoCaptureDevice"
#define PREF_AUDIO_DEVICE		L"DefaultAudioCaptureDevice"
#define PREF_VIDEO_ENCODER		L"DefaultVideoEncoder"
#define PREF_VIDEO_RESOLUTION	L"DefaultVideoResolution"
#define PREF_PHOTO_RESOLUTION	L"DefaultPhotoResolution"

int load_pref(wchar_t* pref_name, wchar_t buf[MAX_DEVICE_NAME_LEN])
{
	DWORD info;
	HKEY key;
	LONG ret;
	DWORD len;
	DWORD type;

	buf[0] = L'\0';

	ret = RegCreateKeyEx(HKEY_CURRENT_USER, CORDOVA_REG_KEY, 0, 0, 0, KEY_READ | KEY_WRITE, 0, &key, &info);

	if (ret != ERROR_SUCCESS)
		return -1;

	if (info == REG_OPENED_EXISTING_KEY)
	{
		len = MAX_DEVICE_NAME_LEN * sizeof(wchar_t);

		ret = RegQueryValueEx(key, pref_name, 0, &type, (LPBYTE) buf, &len);

		if (ret == ERROR_SUCCESS)
		{
			// Return successfully
			RegCloseKey(key);
			return 0;
		}
	}

	RegCloseKey(key);
	return -1;
}

int save_pref(wchar_t* pref_name, wchar_t buf[MAX_DEVICE_NAME_LEN])
{
	DWORD info;
	HKEY key;
	LONG ret;
	DWORD len;

	ret = RegCreateKeyEx(HKEY_CURRENT_USER, CORDOVA_REG_KEY, 0, 0, 0, KEY_READ | KEY_WRITE, 0, &key, &info);

	if (ret != ERROR_SUCCESS)
		return -1;

	// Store it
	len = wcslen(buf) + 1;
	RegSetValueEx(key, pref_name, 0, REG_SZ, (LPBYTE) buf, len*sizeof(wchar_t));

	// There's a slight chance of race condition here ; in that case several different ids would be returned by concurrent executions
	// That can be avoided using a named mutex if that turns out to be a problem
	
	RegCloseKey(key);
	return 0;
}

// Little utility function that computes the length in bytes of a line 
HRESULT get_stride(IMFMediaType* media_type_if, INT32* stride_p, UINT32 width)
{
    GUID sub_type = GUID_NULL;
	INT32 stride = 0;
    HRESULT hr = media_type_if->lpVtbl->GetUINT32(media_type_if, &MF_MT_DEFAULT_STRIDE, (UINT32*)&stride);
  
	if (hr != S_OK)
    {
        // Get the subtype
        hr = media_type_if->lpVtbl->GetGUID(media_type_if, &MF_MT_SUBTYPE, &sub_type);
        
		if (hr == S_OK)
			hr = MFGetStrideForBitmapInfoHeader(sub_type.Data1, width, &stride);
    }

	*stride_p = stride;

    return hr;
}

typedef struct
{
	const GUID*		format_id;
	const wchar_t*	format_name;
}
format_t;

format_t fmt_array[] =
{
	{ &MFVideoFormat_RGB32,	L"RGB32" },
	{ &MFVideoFormat_ARGB32,L"ARGB32" },
	{ &MFVideoFormat_RGB24,	L"RGB24" },
	{ &MFVideoFormat_RGB555,L"RGB555" },
	{ &MFVideoFormat_RGB565,L"RGB565" },
	{ &MFVideoFormat_RGB8,	L"RGB8" },
	{ &MFVideoFormat_AI44,	L"AI44" },
	{ &MFVideoFormat_AYUV,	L"AYUV" },
	{ &MFVideoFormat_YUY2,  L"YUY2" },
	{ &MFVideoFormat_YVYU,  L"YVYU" },
	{ &MFVideoFormat_YVU9,  L"YVU9" },
	{ &MFVideoFormat_UYVY,  L"UYVY" },
	{ &MFVideoFormat_NV11,  L"NV11" },
	{ &MFVideoFormat_NV12,  L"NV12" },
	{ &MFVideoFormat_YV12,  L"YV12" },
	{ &MFVideoFormat_I420,  L"I420" },
	{ &MFVideoFormat_IYUV,  L"IYUV" },
	{ &MFVideoFormat_Y210,  L"Y210" },
	{ &MFVideoFormat_Y216,  L"Y216" },
	{ &MFVideoFormat_Y410,  L"Y410" },
	{ &MFVideoFormat_Y416,  L"Y416" },
	{ &MFVideoFormat_Y41P,  L"Y41P" },
	{ &MFVideoFormat_Y41T,  L"Y41T" },
	{ &MFVideoFormat_Y42T,  L"Y42T" },
	{ &MFVideoFormat_P210,  L"P210" },
	{ &MFVideoFormat_P216,  L"P216" },
	{ &MFVideoFormat_P010,  L"P010" },
	{ &MFVideoFormat_P016,  L"P016" },
	{ &MFVideoFormat_v210,  L"v210" },
	{ &MFVideoFormat_v216,  L"v216" },
	{ &MFVideoFormat_v410,  L"v410" },
	{ &MFVideoFormat_MP43,  L"MP43" },
	{ &MFVideoFormat_MP4S,  L"MP4S" },
	{ &MFVideoFormat_M4S2,  L"M4S2" },
	{ &MFVideoFormat_MP4V,  L"MP4V" },
	{ &MFVideoFormat_WMV1,  L"WMV1" },
	{ &MFVideoFormat_WMV2,  L"WMV2" },
	{ &MFVideoFormat_WMV3,  L"WMV3" },
	{ &MFVideoFormat_WVC1,  L"WVC1" },
	{ &MFVideoFormat_MSS1,  L"MSS1" },
	{ &MFVideoFormat_MSS2,  L"MSS2" },
	{ &MFVideoFormat_MPG1,  L"MPG1" },
	{ &MFVideoFormat_DVSL,  L"DVSL" },
	{ &MFVideoFormat_DVSD,  L"DVSD" },
	{ &MFVideoFormat_DVHD,  L"DVHD" },
	{ &MFVideoFormat_DV25,  L"DV25" },
	{ &MFVideoFormat_DV50,  L"DV50" },
	{ &MFVideoFormat_DVH1,  L"DVH1" },
	{ &MFVideoFormat_DVC,   L"DVC"  },
 	{ &MFVideoFormat_H264,  L"H264" },
	{ &MFVideoFormat_MJPG,  L"MJPG" }
};

const wchar_t* identify_format(const GUID* format)
{	
	int i;
	
	for (i=0; i<sizeof(fmt_array)/sizeof(fmt_array[0]); i++)
		if (IsEqualGUID(format, fmt_array[i].format_id))
			return fmt_array[i].format_name;

	return L"<unknown>";
}


HRESULT add_video_capture_node(IMFTopology* topology_if, IMFMediaSource* av_source_if, IMFPresentationDescriptor* av_pres_descr_if, IMFTopologyNode** video_capture_node_ifp)      
{
    // Initialize the video capture node and add it to our topology
	HRESULT hr;
	IMFStreamDescriptor* stream_desc_if = 0;
	BOOL selected;
	DWORD stream_count;
	DWORD i;
	GUID media_type;
	IMFMediaTypeHandler* cam_type_handler_if = 0;
	IMFTopologyNode* node_if = 0;
	int selected_index = -1;
	DWORD count;
	DWORD w, h;
	DWORD fr1, fr2;
	GUID format;
	int buf_len;
	wchar_t buf[80];
	wchar_t* pref_res;
	BOOL found_video_stream = FALSE;
	UINT32 interlace_mode = 0;

	if (current_action_code == ACTION_PHOTO_CAPTURE)
		pref_res = preferred_photo_resolution;
	else
		pref_res = preferred_video_resolution;

	// Create source node
	hr = MFCreateTopologyNode(MF_TOPOLOGY_SOURCESTREAM_NODE, &node_if);

    // Set our aggregate AV source as media source for this node
    hr = node_if->lpVtbl->SetUnknown(node_if, &MF_TOPONODE_SOURCE, (IUnknown*) av_source_if);

	// Select combined AV presentation descriptor for this node
	hr = node_if->lpVtbl->SetUnknown(node_if, &MF_TOPONODE_PRESENTATION_DESCRIPTOR, (IUnknown*) av_pres_descr_if);
  
	// Select video stream from AV source
	hr = av_pres_descr_if->lpVtbl->GetStreamDescriptorCount(av_pres_descr_if, &stream_count);

	for (i=0; i<stream_count; i++)
	{
		hr = av_pres_descr_if->lpVtbl->GetStreamDescriptorByIndex(av_pres_descr_if, i, &selected, &stream_desc_if);

		if (selected)
		{
			hr = stream_desc_if->lpVtbl->GetMediaTypeHandler(stream_desc_if, &cam_type_handler_if);
			hr = cam_type_handler_if->lpVtbl->GetMajorType(cam_type_handler_if, &media_type);

			if (IsEqualGUID(&media_type, &MFMediaType_Video))
			{
				hr = node_if->lpVtbl->SetUnknown(node_if, &MF_TOPONODE_STREAM_DESCRIPTOR, (IUnknown*) stream_desc_if);

				// Enumerate supported media types
				{
					cam_type_handler_if->lpVtbl->GetMediaTypeCount(cam_type_handler_if, &count);
					
					for (i=0; i<count && selected_index == -1; i++)
					{
						cam_type_handler_if->lpVtbl->GetMediaTypeByIndex(cam_type_handler_if, i, &cam_config_if);

						hr = cam_config_if->lpVtbl->GetGUID(cam_config_if, &MF_MT_SUBTYPE, &format);
						hr = cam_config_if->lpVtbl->GetUINT64(cam_config_if, &MF_MT_FRAME_SIZE, &frame_size);
						hr = cam_config_if->lpVtbl->GetUINT64(cam_config_if, &MF_MT_FRAME_RATE, &frame_rate);
						hr = cam_config_if->lpVtbl->GetUINT32(cam_config_if, &MF_MT_INTERLACE_MODE, &interlace_mode);

						if (interlace_mode == MFVideoInterlace_Progressive)
						{
							w = frame_size >> 32;
							h = (DWORD) frame_size;
							fr1 = frame_rate >> 32;
							fr2 = (DWORD) frame_rate;

							buf_len = wsprintf(buf, L"%d x %d @ %d fps %s", w, h, fr1/fr2, identify_format(&format)/*, interlace_mode == 2 ? L'p' : L'i'*/);

							if (!wmemcmp(buf, pref_res, buf_len))
								selected_index = i;
						}

						RELEASE(cam_config_if);
					}
				}
				
				if (selected_index == -1)
					selected_index = 0;	// No match... use whatever is available (presumably VGA)
				
				// Switch camera to desired mode
				hr = cam_type_handler_if->lpVtbl->GetMediaTypeByIndex(cam_type_handler_if, selected_index, &cam_config_if);
				hr = cam_type_handler_if->lpVtbl->SetCurrentMediaType(cam_type_handler_if, cam_config_if);

				// Gather configuration info that is needed downstream
				hr = cam_config_if->lpVtbl->GetUINT64(cam_config_if, &MF_MT_FRAME_SIZE, &frame_size);
				hr = cam_config_if->lpVtbl->GetUINT64(cam_config_if, &MF_MT_FRAME_RATE, &frame_rate);
				hr = get_stride(cam_config_if, &scan_len, frame_size >> 32);

				// Finally add this node to the topology
				hr = topology_if->lpVtbl->AddNode(topology_if, node_if);
				found_video_stream = TRUE;
				RELEASE(stream_desc_if);
				break;
			}
		}

		RELEASE(stream_desc_if);
	}

	if (found_video_stream)
		*video_capture_node_ifp = node_if;
	else
		*video_capture_node_ifp = 0;
		
	RELEASE(node_if);
	RELEASE(cam_type_handler_if);
	return hr;
}


HRESULT add_frame_grabber_node (IMFTopology* topology_if, IMFMediaType* input_type_if, IMFTopologyNode** frame_grabber_node_ifp)
{
	HRESULT hr;
	IMFActivate* sink_activate_if = 0;
	IMFTopologyNode* grabber_node_if = 0;
	IMFMediaType* grabber_config_if = 0;
	GUID input_format;

	hr = input_type_if->lpVtbl->GetGUID(input_type_if, &MF_MT_SUBTYPE, &input_format);

	hr = MFCreateMediaType(&grabber_config_if);
	hr = grabber_config_if->lpVtbl->SetGUID(grabber_config_if, &MF_MT_MAJOR_TYPE, &MFMediaType_Video);     

	// If the cam is sending JPEG frames use that for the frame grabber node, otherwise request RGB 24 bpp representation
	mjpeg_mode = 0; // IsEqualGUID(&input_format, &MFVideoFormat_MJPG); disabled for now ; some webcams send JFIF frames,
					// others AVI1 MJPEG frames (JPEG minus DHT segment) ; the missing Huffman table contents is fixed,
					// so it can be added programatically, but for single-frame capture we don't really need to optimize,
					// and using MJPEG rather than YUV or RGB modes may make the preview more costly
		
	if (mjpeg_mode)
		hr = grabber_config_if->lpVtbl->SetGUID(grabber_config_if, &MF_MT_SUBTYPE, &MFVideoFormat_MJPG);
	else
		hr = grabber_config_if->lpVtbl->SetGUID(grabber_config_if, &MF_MT_SUBTYPE, &MFVideoFormat_RGB24);

	hr = MFCreateSampleGrabberSinkActivate(grabber_config_if, (IMFSampleGrabberSinkCallback*) &sgsc, &sink_activate_if);

	RELEASE_Z(grabber_config_if);

	// Create output node
	hr = MFCreateTopologyNode(MF_TOPOLOGY_OUTPUT_NODE, &grabber_node_if);

	// Associate sink to node
	hr = grabber_node_if->lpVtbl->SetObject(grabber_node_if, (IUnknown*) sink_activate_if);

	// Add node to the topology
    hr = topology_if->lpVtbl->AddNode(topology_if, grabber_node_if);

	*frame_grabber_node_ifp = grabber_node_if;

	RELEASE(grabber_node_if);
	RELEASE(sink_activate_if);

	return hr;
}


HRESULT add_audio_capture_node(IMFTopology* topology_if, IMFMediaSource* av_source_if, IMFPresentationDescriptor* av_pres_descr_if, IMFTopologyNode** audio_capture_node_ifp)      
{
    // Initialize the audio capture node and add it to our topology
	HRESULT hr;
	IMFStreamDescriptor* stream_desc_if = 0;
	BOOL selected = 0;
	DWORD stream_count = 0;
	DWORD i;
	GUID media_type;
	IMFMediaTypeHandler* mic_type_handler_if = 0;
	IMFTopologyNode* node_if = 0;
	int num_channels = 2;
	BOOL found_audio_stream = FALSE;
	IMFMediaType* test_config_if = 0;

	// Create source node
	hr = MFCreateTopologyNode(MF_TOPOLOGY_SOURCESTREAM_NODE, &node_if);

    // Set our aggregate AV source as media source for this node
    hr = node_if->lpVtbl->SetUnknown(node_if, &MF_TOPONODE_SOURCE, (IUnknown*) av_source_if);

	// Select combined AV presentation descriptor for this node
	hr = node_if->lpVtbl->SetUnknown(node_if, &MF_TOPONODE_PRESENTATION_DESCRIPTOR, (IUnknown*) av_pres_descr_if);
  
	// Select audio stream from AV source
	hr = av_pres_descr_if->lpVtbl->GetStreamDescriptorCount(av_pres_descr_if, &stream_count);

	for (i=0; i<stream_count; i++)
	{
		hr = av_pres_descr_if->lpVtbl->GetStreamDescriptorByIndex(av_pres_descr_if, i, &selected, &stream_desc_if);

		if (selected)
		{
			hr = stream_desc_if->lpVtbl->GetMediaTypeHandler(stream_desc_if, &mic_type_handler_if);
			hr = mic_type_handler_if->lpVtbl->GetMajorType(mic_type_handler_if, &media_type);

			if (IsEqualGUID(&media_type, &MFMediaType_Audio))
			{
//				hr = mic_type_handler_if->lpVtbl->GetCurrentMediaType(mic_type_handler_if, &mic_config_if);
				hr = MFCreateMediaType(&test_config_if);
	
				// Switch to PCM 16 bits @ 48 KHz format as that's what the AAC encoder takes as input
		
				hr = test_config_if->lpVtbl->SetGUID(test_config_if, &MF_MT_MAJOR_TYPE, &MFMediaType_Audio);
				hr = test_config_if->lpVtbl->SetGUID(test_config_if, &MF_MT_SUBTYPE, &MFAudioFormat_PCM);
				hr = test_config_if->lpVtbl->SetUINT32(test_config_if, &MF_MT_AUDIO_BITS_PER_SAMPLE, 16);
				hr = test_config_if->lpVtbl->SetUINT32(test_config_if, &MF_MT_AUDIO_SAMPLES_PER_SECOND, 48000);

				// Check if the format is supported ; the call optionally returns a related media type if it isn't
				hr = mic_type_handler_if->lpVtbl->IsMediaTypeSupported(mic_type_handler_if, test_config_if, &mic_config_if);

				if (hr == S_OK)
				{
					mic_config_if = test_config_if;
				}
				else
				{
					RELEASE(test_config_if);
				}

				if (mic_config_if)
					hr = mic_type_handler_if->lpVtbl->SetCurrentMediaType(mic_type_handler_if, mic_config_if);
				else
					hr = mic_type_handler_if->lpVtbl->GetCurrentMediaType(mic_type_handler_if, &mic_config_if);
				
				hr = node_if->lpVtbl->SetUnknown(node_if, &MF_TOPONODE_STREAM_DESCRIPTOR, (IUnknown*) stream_desc_if);
				
				// Finally add this node to the topology
				hr = topology_if->lpVtbl->AddNode(topology_if, node_if);
				found_audio_stream = TRUE;
				break;
			}
		}
		
		RELEASE(stream_desc_if);
	}

	if (found_audio_stream)
		*audio_capture_node_ifp = node_if;
	else
		*audio_capture_node_ifp = 0;

	RELEASE(node_if);
	RELEASE(mic_type_handler_if);

	return hr;
}


HRESULT configure_mft(IMFTransform* mft_if)
{
    IMFAttributes *attributes_if = 0;
	HRESULT hr;
	
	hr = mft_if->lpVtbl->GetAttributes(mft_if, &attributes_if);

    if (attributes_if)
    {
        hr = attributes_if->lpVtbl->SetUINT32(attributes_if, &MF_TRANSFORM_ASYNC_UNLOCK, TRUE);
        hr = attributes_if->lpVtbl->SetUINT32(attributes_if, &MF_LOW_LATENCY, TRUE);
	
		RELEASE(attributes_if);
    }

    return hr;
}


IMFTransform* get_encoder (BOOL video)
{
	HRESULT hr;
	DWORD count = 0;
	DWORD i;
	IMFActivate** activate_array = 0;
	IMFTransform* encoder_if = 0;
	int selected_encoder;
	DWORD additional_flags = MFT_ENUM_FLAG_HARDWARE;
	GUID mft_category;
	MFT_REGISTER_TYPE_INFO codec;

	selected_encoder = 0;
		
	if (video)
	{
		mft_category =			MFT_CATEGORY_VIDEO_ENCODER;
		codec.guidMajorType =	MFMediaType_Video;
		codec.guidSubtype =		MFVideoFormat_H264;
	}	
	else
	{
		mft_category =			MFT_CATEGORY_AUDIO_ENCODER;
		codec.guidMajorType =	MFMediaType_Audio;
		codec.guidSubtype =		MFAudioFormat_AAC;
	}

please_try_again:

	hr = MFTEnumEx(mft_category, MFT_ENUM_FLAG_SYNCMFT | MFT_ENUM_FLAG_ASYNCMFT | additional_flags | MFT_ENUM_FLAG_SORTANDFILTER,  0, &codec, &activate_array, &count);

	if (count > 0)
	{
		if (video)
		{
			// List names, looking for a match
			for (i=0; i<count; i++)
			{
				LPWSTR name = 0;
			
				hr = activate_array[i]->lpVtbl->GetAllocatedString(activate_array[i], &MFT_FRIENDLY_NAME_Attribute, &name, 0);

				if (!wmemcmp(name, preferred_video_encoder, wcslen(name)))
					selected_encoder = i;

       			CoTaskMemFree(name);
			}
		}

		// Instanciate encoder
		hr = activate_array[selected_encoder]->lpVtbl->ActivateObject(activate_array[0], &IID_IMFTransform, &encoder_if);

		for (i=0; i<count; i++)
			RELEASE(activate_array[i]);

		CoTaskMemFree(activate_array);
	}

	// Some drivers list hardware accelerated encoders but don't allow instanciating them... fall back to first available software encoder
	if (!encoder_if && additional_flags)
	{
		additional_flags = 0;
		selected_encoder = 0;
		goto please_try_again;
	}

	return encoder_if;	// Return MFT interface to caller, which is responsible for shutting it down / releasing it
}


HRESULT add_video_compression_node (IMFTopology* topology_if, IMFTopologyNode** video_compression_node_ifp)
{
    HRESULT hr;
	IMFTopologyNode* node_if = 0;
	int video_bit_rate;

	// Create transform
	video_compr_transform_if = get_encoder(TRUE);

	configure_mft(video_compr_transform_if);

	hr = MFCreateMediaType(&h264_config_if);

	hr = h264_config_if->lpVtbl->SetGUID(h264_config_if, &MF_MT_MAJOR_TYPE, &MFMediaType_Video);     
	hr = h264_config_if->lpVtbl->SetUINT64(h264_config_if, &MF_MT_FRAME_SIZE, frame_size);
	hr = h264_config_if->lpVtbl->SetUINT64(h264_config_if, &MF_MT_FRAME_RATE, frame_rate);
	hr = h264_config_if->lpVtbl->SetUINT32(h264_config_if, &MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive);
	
	hr = h264_config_if->lpVtbl->SetGUID(h264_config_if, &MF_MT_SUBTYPE, &MFVideoFormat_H264);

	video_bit_rate = VIDEO_BIT_RATE;
	
	hr = h264_config_if->lpVtbl->SetUINT32(h264_config_if, &MF_MT_AVG_BITRATE, video_bit_rate);
	hr = h264_config_if->lpVtbl->SetUINT32(h264_config_if, &MF_MT_MPEG2_PROFILE, eAVEncH264VProfile_Main);
	hr = h264_config_if->lpVtbl->SetUINT32(h264_config_if, &MF_MT_MPEG2_LEVEL, eAVEncH264VLevel4_1);


	hr = video_compr_transform_if->lpVtbl->SetOutputType(video_compr_transform_if, 0, h264_config_if, 0);
	hr = video_compr_transform_if->lpVtbl->SetInputType(video_compr_transform_if, 0, conv_config_if, 0);

	RELEASE_Z(conv_config_if);
	
	// Create node
	hr = MFCreateTopologyNode(MF_TOPOLOGY_TRANSFORM_NODE, &node_if);

    // Set object pointer
	hr = node_if->lpVtbl->SetObject(node_if, (IUnknown*) video_compr_transform_if);
  
	// Add node
    hr = topology_if->lpVtbl->AddNode(topology_if, node_if);

	*video_compression_node_ifp = node_if;
	
	RELEASE(node_if);


	return hr;
}


HRESULT add_audio_compression_node (IMFTopology* topology_if, IMFTopologyNode** audio_compression_node_ifp)
{
    HRESULT hr;
	IMFTopologyNode* node_if = 0;

	// Create AAC encoding transform
	audio_compr_transform_if = get_encoder(FALSE);
	
	hr = MFCreateMediaType(&aac_config_if);

	hr = aac_config_if->lpVtbl->SetGUID(aac_config_if, &MF_MT_MAJOR_TYPE, &MFMediaType_Audio);     
	hr = aac_config_if->lpVtbl->SetGUID(aac_config_if, &MF_MT_SUBTYPE, &MFAudioFormat_AAC);

	hr = aac_config_if->lpVtbl->SetUINT32(aac_config_if, &MF_MT_AUDIO_NUM_CHANNELS, 2);
	hr = aac_config_if->lpVtbl->SetUINT32(aac_config_if, &MF_MT_AUDIO_SAMPLES_PER_SECOND, 48000);
	hr = aac_config_if->lpVtbl->SetUINT32(aac_config_if, &MF_MT_AUDIO_BITS_PER_SAMPLE, 16);
	hr = aac_config_if->lpVtbl->SetUINT32(aac_config_if, &MF_MT_AUDIO_AVG_BYTES_PER_SECOND, AUDIO_BIT_RATE/8);

	// Set audio compression engine parameters
	hr = audio_compr_transform_if->lpVtbl->SetOutputType(audio_compr_transform_if, 0, aac_config_if, 0);
	hr = audio_compr_transform_if->lpVtbl->SetInputType(audio_compr_transform_if, 0, mic_config_if, 0);

	RELEASE_Z(mic_config_if);
	
	// Create node
	hr = MFCreateTopologyNode(MF_TOPOLOGY_TRANSFORM_NODE, &node_if);

    // Set object pointer
	hr = node_if->lpVtbl->SetObject(node_if, (IUnknown*) audio_compr_transform_if);
  
	// Add node
    hr = topology_if->lpVtbl->AddNode(topology_if, node_if);

	*audio_compression_node_ifp = node_if;
		
	RELEASE(node_if);

	return hr;
}


HRESULT add_color_transform_node (IMFTopology* topology_if, IMFTopologyNode** color_transform_node_ifp)
{
	// The webcam sends a RGB stream that needs to be converted to YUV before it reaches the h264 encoder
	// The NV12 encoding is suitable for use by h264 hardware encoders ;  
	// MFVideoFormat_YUY2 might be more appropriate if the Microsoft H.264 software encoder is used
	HRESULT hr;
	IMFTopologyNode* node_if = 0;

	hr = MFCreateMediaType(&conv_config_if);

	hr = conv_config_if->lpVtbl->SetGUID(conv_config_if, &MF_MT_MAJOR_TYPE, &MFMediaType_Video);     
	hr = conv_config_if->lpVtbl->SetGUID(conv_config_if, &MF_MT_SUBTYPE, &MFVideoFormat_NV12);
	hr = conv_config_if->lpVtbl->SetUINT64(conv_config_if, &MF_MT_FRAME_SIZE, frame_size);
	hr = conv_config_if->lpVtbl->SetUINT64(conv_config_if, &MF_MT_FRAME_RATE, frame_rate);
	hr = conv_config_if->lpVtbl->SetUINT32(conv_config_if, &MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive);

	// Create output node
	hr = MFCreateTopologyNode(MF_TOPOLOGY_TRANSFORM_NODE, &node_if);

	color_transform_if = 0;
	
	hr = CoCreateInstance(&CLSID_CColorConvertDMO, NULL, CLSCTX_INPROC, &IID_IMFTransform, (void**) &color_transform_if);

	hr = color_transform_if->lpVtbl->SetOutputType(color_transform_if, 0, conv_config_if, 0);
	hr = color_transform_if->lpVtbl->SetInputType(color_transform_if, 0, cam_config_if, 0);

	RELEASE_Z(cam_config_if);

	hr = node_if->lpVtbl->SetObject(node_if, (IUnknown*) color_transform_if);

	// Add this node to the topology
    hr = topology_if->lpVtbl->AddNode(topology_if, node_if);
	
	*color_transform_node_ifp = node_if;
		
	RELEASE(node_if);

	return hr;
}


HRESULT add_file_output_nodes (IMFTopology* topology_if, IMFTopologyNode** video_output_node_ifp, IMFTopologyNode** audio_output_node_ifp, wchar_t* file_name)
{
	// Create an archive sink for AVC/AAC output then initialize a matching node and add it to the topology
	
	HRESULT hr;
	IMFStreamSink *video_stream_sink_if = 0;
	IMFStreamSink *audio_stream_sink_if = 0;
	IMFTopologyNode* v_node_if = 0;
	IMFTopologyNode* a_node_if = 0;
	IMFByteStream* byte_stream_if = 0;

	hr = MFCreateFile(MF_ACCESSMODE_READWRITE, MF_OPENMODE_DELETE_IF_EXIST, MF_FILEFLAGS_NONE, file_name, &byte_stream_if);

	hr = MFCreateMPEG4MediaSink(byte_stream_if, h264_config_if, aac_config_if, &media_sink_if);

	if (hr == S_OK)
	{
		if (h264_config_if)
		{	
			// Get video sink
			hr = media_sink_if->lpVtbl->GetStreamSinkByIndex(media_sink_if, 0, &video_stream_sink_if);

			// Create video output node
			hr = MFCreateTopologyNode(MF_TOPOLOGY_OUTPUT_NODE, &v_node_if);

			// Associate video sink to node
			hr = v_node_if->lpVtbl->SetObject(v_node_if, (IUnknown*) video_stream_sink_if);

			// Add node to the topology
			hr = topology_if->lpVtbl->AddNode(topology_if, v_node_if);
		}

		if (aac_config_if)
		{
			hr = media_sink_if->lpVtbl->GetStreamSinkByIndex(media_sink_if, h264_config_if ? 1 : 0, &audio_stream_sink_if);
			hr = MFCreateTopologyNode(MF_TOPOLOGY_OUTPUT_NODE, &a_node_if);
			hr = a_node_if->lpVtbl->SetObject(a_node_if, (IUnknown*) audio_stream_sink_if);
			hr = topology_if->lpVtbl->AddNode(topology_if, a_node_if);
		}
	}

	*video_output_node_ifp = v_node_if;
	*audio_output_node_ifp = a_node_if;

	RELEASE_Z(h264_config_if);
	RELEASE_Z(aac_config_if);	
	RELEASE(v_node_if);
	RELEASE(a_node_if);
	RELEASE(video_stream_sink_if);
	RELEASE(audio_stream_sink_if);
	RELEASE(byte_stream_if);

	return hr;
}


HRESULT add_tee_node(IMFTopology* topology_if, IMFTopologyNode** tee_node_ifp)
{
	// We'll use a tee node to split the video stream towards EVR (for preview) and media sink
	HRESULT hr;
	IMFTopologyNode* node_if = 0;
	
	// Create node
	hr = MFCreateTopologyNode(MF_TOPOLOGY_TEE_NODE, &node_if);

/*	hr = node_if->lpVtbl->SetInputPrefType(node_if, 0, cam_config_if);
 	hr = node_if->lpVtbl->SetOutputPrefType(node_if, 0, cam_config_if);
	hr = node_if->lpVtbl->SetOutputPrefType(node_if, 1, cam_config_if);*/

	// Add node
	hr = topology_if->lpVtbl->AddNode(topology_if, node_if);

	*tee_node_ifp = node_if;

	RELEASE(node_if);

	return hr;
}


HRESULT create_av_source (IMFMediaSource** av_source_ifp)
{
    // We may get video from a cam and audio from a separate mic - Handle them as two streams coming out of a single media source
	HRESULT hr;
	IMFCollection* collection_if = 0;
	
	hr = MFCreateCollection(&collection_if);

	if (video_source_if)
		hr = collection_if->lpVtbl->AddElement(collection_if, (IUnknown*) video_source_if);
	
	if (audio_source_if)
		hr = collection_if->lpVtbl->AddElement(collection_if, (IUnknown*) audio_source_if);
	
	hr = MFCreateAggregateSource(collection_if, av_source_ifp);

	RELEASE(collection_if);

	return hr;    
}


HRESULT select_video_capture_device (IMFMediaSource** video_source_ifp, wchar_t* preferred_device_name)
{	
	// Select a suitable video capture device and initialize video source object
	
	HRESULT hr;
	IMFAttributes* attributes_if = 0;
	IMFActivate** activate_array;
	UINT32 count = 0;
	IMFActivate* activate_if;
	UINT32 i;
	int selected_video_capture_dev = 0;

	*video_source_ifp = 0;

    // Create a container for enumeration criteria
    hr = MFCreateAttributes(&attributes_if, 1);
    
	// List video capture devices    
    hr = attributes_if->lpVtbl->SetGUID(attributes_if, &MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE, &MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE_VIDCAP_GUID);
    hr = MFEnumDeviceSources(attributes_if, &activate_array, &count);

	// Release attributes
	RELEASE(attributes_if);

	// List names
	for (i=0; i<count; i++)
	{
		LPWSTR name = 0;
			
		hr = activate_array[i]->lpVtbl->GetAllocatedString(activate_array[i], &MF_DEVSOURCE_ATTRIBUTE_FRIENDLY_NAME, &name, 0);

		if (!wmemcmp(name, preferred_device_name, wcslen(name)))
			selected_video_capture_dev = i;

       	CoTaskMemFree(name);
	}

	// No camera
	if (count == 0)
		return S_OK;

	activate_if = activate_array[selected_video_capture_dev];
	
    // Get media source for selected capture device
	hr = activate_if->lpVtbl->ActivateObject(activate_if, &IID_IMFMediaSource, video_source_ifp);
   	
	// Release array elements
	for (i=0; i<count; i++)
	{
		RELEASE(activate_array[i]);
	}

	CoTaskMemFree(activate_array);

    return hr;
}


HRESULT select_audio_capture_device (IMFMediaSource** audio_source_ifp)
{	
	// Select a suitable video audio device and initialize audio source object
	
	HRESULT hr;
	IMFAttributes* attributes_if = 0;
	IMFActivate** activate_array;
	UINT32 count = 0;
	IMFActivate* activate_if = 0;
	UINT32 i;
	int selected_audio_capture_dev = 0;

	*audio_source_ifp = 0;
	
    // Create a container for enumeration criteria
	hr = MFCreateAttributes(&attributes_if, 1);
    
	// List audio capture devices    
    hr = attributes_if->lpVtbl->SetGUID(attributes_if, &MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE, &MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE_AUDCAP_GUID);
	hr = MFEnumDeviceSources(attributes_if, &activate_array, &count);
	
	// List names
	for (i=0; i<count; i++)
	{
		LPWSTR name = 0;
			
		hr = activate_array[i]->lpVtbl->GetAllocatedString(activate_array[i], &MF_DEVSOURCE_ATTRIBUTE_FRIENDLY_NAME, &name, 0);

		if (!wmemcmp(name, preferred_audio_capture_dev, wcslen(name)))
			selected_audio_capture_dev = i;

       	CoTaskMemFree(name);
	}

	if (count)
		activate_if = activate_array[selected_audio_capture_dev];
	

	// Release attributes
	RELEASE(attributes_if);

    // Get media source for selected capture device
	if (activate_if)
		hr = activate_if->lpVtbl->ActivateObject(activate_if, &IID_IMFMediaSource, audio_source_ifp);
    
	// Release array elements
	for (i=0; i<count; i++)
	{
		RELEASE(activate_array[i]);
	}

	CoTaskMemFree(activate_array);

    return hr;
}


HRESULT add_video_preview_node (IMFTopology* topology_if, IMFTopologyNode** video_preview_node_ifp)
{
	// Initialize the video preview sink and add it to the topology
	HRESULT hr;
	IMFActivate* activate_if = 0;
	IMFTopologyNode* node_if = 0;

	// Create output node
	hr = MFCreateTopologyNode(MF_TOPOLOGY_OUTPUT_NODE, &node_if);

	// Create activation object for EVR sink - clip to preview window
	hr = MFCreateVideoRendererActivate(hPreviewWnd, &activate_if);
 
	// Associate it to our newly created output node
	hr = node_if->lpVtbl->SetObject(node_if, (IUnknown*) activate_if);
	
	// Add this node to the topology
    hr = topology_if->lpVtbl->AddNode(topology_if, node_if);

	*video_preview_node_ifp = node_if;
		
	RELEASE(node_if);
	RELEASE(activate_if);

	return S_OK;
}


void camera_resize_window(int width, int height)
{
	HRESULT hr;
	
	if (video_display_control_if)
	{
		RECT rc = {0, 0, width, height};
		hr = video_display_control_if->lpVtbl->SetVideoPosition(video_display_control_if, NULL, &rc);
	}
}

void camera_notify_display_change (void)
{
}

void prepare_video_framing (IMFTopology* topology_if)
{
	HRESULT hr;
	IMFPresentationDescriptor* av_pres_descr_if = 0;
	IMFTopologyNode*	video_capture_node_if = 0;
	IMFTopologyNode*	video_preview_node_if = 0;
	IMFMediaSource*	av_source_if = 0;

	// Select video input device
	hr = select_video_capture_device(&video_source_if, preferred_video_capture_dev);

	// Create combined AV source - a media session can only be associated to a single source
	// Not required since we're not dealing with audio here though, but let's share code with the video case
	hr = create_av_source(&av_source_if);

	if (av_source_if)
	{
		// Create a presentation descriptor
		hr = av_source_if->lpVtbl->CreatePresentationDescriptor(av_source_if, &av_pres_descr_if);

		// Add capture node and connect it to the topology
		hr = add_video_capture_node(topology_if, av_source_if, av_pres_descr_if, &video_capture_node_if);

		// Our AV source object is now referenced by its users, let's release our own ref
		RELEASE(av_source_if);
	
		// The presentation descriptor isn't needed anymore either
		RELEASE(av_pres_descr_if);

		// Create video renderer
		hr = add_video_preview_node(topology_if, &video_preview_node_if);

		RELEASE_Z(cam_config_if);

		// Video stream connected to preview node
		if (video_capture_node_if)
			hr = video_capture_node_if->lpVtbl->ConnectOutput(video_capture_node_if, 0, video_preview_node_if, 0);
	}

	// OK we're done with nodes - release our COM references
	RELEASE(video_capture_node_if);
	RELEASE(video_preview_node_if);
}

void prepare_video_capture (IMFTopology* topology_if, wchar_t* file_name)
{
	// Record video to file_name
	
	HRESULT hr;
	IMFPresentationDescriptor* av_pres_descr_if = 0;
	IMFTopologyNode*	video_capture_node_if = 0;
	IMFTopologyNode*	audio_capture_node_if = 0;
	IMFTopologyNode*	video_preview_node_if = 0;
	IMFTopologyNode*	tee_node_if = 0;
	IMFTopologyNode*	color_transform_node_if = 0;
	IMFTopologyNode*	video_compression_node_if = 0;
	IMFTopologyNode*	audio_compression_node_if = 0;
	IMFTopologyNode*	video_output_node_if = 0;
	IMFTopologyNode*	audio_output_node_if = 0;
	IMFMediaSource*	av_source_if = 0;

	// Select video and audio input devices
	hr = select_video_capture_device(&video_source_if, preferred_video_capture_dev);
	hr = select_audio_capture_device(&audio_source_if);

	// Create combined AV source - a media session can only be associated to a single source
	hr = create_av_source(&av_source_if);

	if (av_source_if)
	{
		// Create a presentation descriptor in charge of both audio and video streams
		hr = av_source_if->lpVtbl->CreatePresentationDescriptor(av_source_if, &av_pres_descr_if);

		// Add video and audio capture nodes and connect them to the topology
		hr = add_video_capture_node(topology_if, av_source_if, av_pres_descr_if, &video_capture_node_if);
		hr = add_audio_capture_node(topology_if, av_source_if, av_pres_descr_if, &audio_capture_node_if);

		
		if (video_capture_node_if)
		{
			// Create video renderer
			hr = add_video_preview_node(topology_if, &video_preview_node_if);

			// Create video stream splitter
			hr = add_tee_node(topology_if, &tee_node_if);

			// Create video compression node, as well as colorspace conversion node, required for RGB->YUV conversion prior to H.264 compression
			hr = add_color_transform_node(topology_if, &color_transform_node_if);
			hr = add_video_compression_node(topology_if, &video_compression_node_if);
		}
		
		if (audio_capture_node_if)
		{
			// AAC transform
			hr = add_audio_compression_node(topology_if, &audio_compression_node_if);
		}

		// Our AV source object is now referenced by its users, let's release our own ref
		RELEASE(av_source_if);
	
		// The presentation descriptor isn't needed anymore either
		RELEASE(av_pres_descr_if);

		// Create sink nodes
		hr = add_file_output_nodes(topology_if, &video_output_node_if, &audio_output_node_if, file_name);

		if (hr == S_OK)
		{
			if (video_capture_node_if)
			{
				// Video stream connected to colorspace conversion node ; better do it before going through the tee
				hr = video_capture_node_if->lpVtbl->ConnectOutput(video_capture_node_if, 0, color_transform_node_if, 0);

				// Colorspace conversion output connected to tee
				hr = color_transform_node_if->lpVtbl->ConnectOutput(color_transform_node_if, 0, tee_node_if, 0);

				// Tee outputs connected to video preview node and video compression node
				hr = tee_node_if->lpVtbl->ConnectOutput(tee_node_if, 0, video_preview_node_if, 0);
				hr = tee_node_if->lpVtbl->ConnectOutput(tee_node_if, 1, video_compression_node_if, 0);

				// Direct compressed video stream to video archival sink
				hr = video_compression_node_if->lpVtbl->ConnectOutput(video_compression_node_if, 0, video_output_node_if, 0);
			}

			if (audio_capture_node_if)
			{
				// Audio input connected to audio encoder
				hr = audio_capture_node_if->lpVtbl->ConnectOutput(audio_capture_node_if, 0, audio_compression_node_if, 0);

				// Direct audio stream to audio sink
				hr = audio_compression_node_if->lpVtbl->ConnectOutput(audio_compression_node_if, 0, audio_output_node_if, 0);
			}
		}
	}

	// OK we're done with nodes - release our COM references
	RELEASE(video_capture_node_if);
	RELEASE(audio_capture_node_if);
	RELEASE(video_preview_node_if);
	RELEASE(color_transform_node_if);
	RELEASE(video_compression_node_if);
	RELEASE(audio_compression_node_if);
	RELEASE(tee_node_if);
	RELEASE(video_output_node_if);
	RELEASE(audio_output_node_if);
}


void prepare_photo_capture (IMFTopology* topology_if)
{
	HRESULT hr;
	IMFPresentationDescriptor*	av_pres_descr_if = 0;
	IMFTopologyNode*	video_capture_node_if = 0;
	IMFTopologyNode*	video_preview_node_if = 0;
	IMFTopologyNode*	tee_node_if = 0;
	IMFTopologyNode*	frame_grabber_if = 0;
	IMFMediaSource*		av_source_if = 0;

	// Select video input device
	hr = select_video_capture_device(&video_source_if, preferred_video_capture_dev);

	// Create combined AV source - a media session can only be associated to a single source
	// Not required since we're not dealing with audio here though, but let's share code with the video case
	hr = create_av_source(&av_source_if);

	if (av_source_if)
	{
		// Create a presentation descriptor
		hr = av_source_if->lpVtbl->CreatePresentationDescriptor(av_source_if, &av_pres_descr_if);

		// Add capture node and connect it to the topology
		hr = add_video_capture_node(topology_if, av_source_if, av_pres_descr_if, &video_capture_node_if);

		// Our AV source object is now referenced by its users, let's release our own ref
		RELEASE(av_source_if);
	
		// The presentation descriptor isn't needed anymore either
		RELEASE(av_pres_descr_if);

		// Create video renderer
		hr = add_video_preview_node(topology_if, &video_preview_node_if);

		// Create video stream splitter
		hr = add_tee_node(topology_if, &tee_node_if);

		// Create frame grabber sink node
		hr = add_frame_grabber_node(topology_if, cam_config_if, &frame_grabber_if);

		RELEASE_Z(cam_config_if);

		// Video stream connected to tee input
		hr = video_capture_node_if->lpVtbl->ConnectOutput(video_capture_node_if, 0, tee_node_if, 0);

		// Tee outputs connected to video preview node and frame grabber node
		hr = tee_node_if->lpVtbl->ConnectOutput(tee_node_if, 0, video_preview_node_if, 0);
		hr = tee_node_if->lpVtbl->ConnectOutput(tee_node_if, 1, frame_grabber_if, 0);
	}

	// OK we're done with nodes - release our COM references
	RELEASE(video_capture_node_if);
	RELEASE(video_preview_node_if);
	RELEASE(tee_node_if);
	RELEASE(frame_grabber_if);
}


IMFTopology* build_topology (int topo_type)
{
	// Build a topology suitable for the specified task
	// The topology will then be associated to a media session, and destroyed when the session completes
	HRESULT hr;
	IMFTopology* topology_if = 0;
	SYSTEMTIME t;

	hr = MFStartup(MF_VERSION, MFSTARTUP_NOSOCKET);
		
	// Create a blank topology
	hr = MFCreateTopology(&topology_if);

	// Since we're targeting Windows 7 and newer, enable available hardware acceleration
	topology_if->lpVtbl->SetUINT32(topology_if, &MF_TOPOLOGY_DXVA_MODE, MFTOPOLOGY_DXVA_FULL);
	topology_if->lpVtbl->SetUINT32(topology_if, &MF_TOPOLOGY_HARDWARE_MODE, MFTOPOLOGY_HWMODE_USE_HARDWARE);

	switch (topo_type)
	{
		case PHOTO_CAPTURE_TOPO:
			prepare_photo_capture(topology_if);
			break;

		case VIDEO_FRAMING_TOPO:
			prepare_video_framing(topology_if);
			break;

		case VIDEO_CAPTURE_TOPO:
			GetLocalTime(&t);
			swprintf(last_recorded_file_name, MAX_FILE_NAME_LEN, L"%0d%02d%02d-%02d%02d%02d.mp4", t.wYear, t.wMonth, t.wDay, t.wHour, t.wMinute, t.wSecond);
			swprintf(last_recorded_file_name_full, MAX_FILE_NAME_LEN, L"%s%s", temp_directory_win, last_recorded_file_name);
			last_recorded_file_name_full[MAX_FILE_NAME_LEN] = 0;
			prepare_video_capture(topology_if, last_recorded_file_name_full);
			break;
		
		case AUDIO_CAPTURE_TOPO:
		case AUDIO_PLAYBACK_TOPO:
			break;
	}

	return topology_if;
}

//-------------------------------------------------------------------------------------------------

unsigned int __stdcall session_control_proc(void* param)
{
	// Create a session for the current topology and manage its lifecycle
	// The session can be stopped from another thread
	
	HRESULT hr;
    PROPVARIANT var;
	BOOL done = FALSE;
	IMFTopology* topology_if = (IMFTopology*) param;

	set_thread_name(-1, "Media Session Control");

	CoInitialize(0);
	
	SetThreadPriority(GetCurrentThread(), THREAD_PRIORITY_ABOVE_NORMAL);

	hr = MFCreateMediaSession(0, &media_session_if);

	if (!media_session_if)
		goto the_end;

	// Associate topology to session
	hr = media_session_if->lpVtbl->SetTopology(media_session_if, MFSESSION_SETTOPOLOGY_IMMEDIATE, topology_if);

	if (hr !=  S_OK)
		goto the_end;

	do
    {
        HRESULT status = 0;
        IMFMediaEvent *event_if = 0;
        MediaEventType media_event_type = 0;
        MF_TOPOSTATUS topo_status = 0;
    
        hr = media_session_if->lpVtbl->GetEvent(media_session_if, 0, &event_if);
		hr = event_if->lpVtbl->GetStatus(event_if, &status);
		hr = event_if->lpVtbl->GetType(event_if, &media_event_type);

        if (SUCCEEDED(hr) && SUCCEEDED(status))
        {
            switch (media_event_type)
            {
				case MESessionTopologyStatus:

					hr = event_if->lpVtbl->GetUINT32(event_if, &MF_EVENT_TOPOLOGY_STATUS, (UINT32*) &topo_status);
					
					if (SUCCEEDED(hr))
					{
						switch (topo_status)
						{
							case MF_TOPOSTATUS_READY:
								// Get IMFVideoDisplayControl interface - we'll need it around to control the video renderer rectangle
								hr = MFGetService((IUnknown*) media_session_if, &MR_VIDEO_RENDER_SERVICE, &IID_IMFVideoDisplayControl, (void**) &video_display_control_if);
								
								// Fire up media playback (with no particular starting position)
								PropVariantInit(&var);
								var.vt = VT_EMPTY;
								hr = media_session_if->lpVtbl->Start(media_session_if, &GUID_NULL, &var);
								PropVariantClear(&var);
								break;

							case MF_TOPOSTATUS_STARTED_SOURCE:
								start_time = MFGetSystemTime();
								break;

							case MF_TOPOSTATUS_ENDED:
								break;
						}
					}
					break;

            case MESessionStarted:
				break;

			case MESessionEnded:
                // In the case of capture, another thread will call Stop
				hr = media_session_if->lpVtbl->Stop(media_session_if);
                break;

            case MESessionStopped:
				// The MPEG 4 media sink is finalizable, and the session should invoke the finalization routines at this point
				hr = media_session_if->lpVtbl->Close(media_session_if);
				break;

            case MESessionClosed:
				done = TRUE;
                break;

            default:
                break;
            }
        }

        RELEASE(event_if);

        if (FAILED(hr) || FAILED(status))
        {
            done = TRUE;
        }

    }
	while (!done);
	
	// Session closed - sources, sinks and activated objects need to be closed before being released

the_end:

	if (audio_source_if)
	{
		audio_source_if->lpVtbl->Shutdown(audio_source_if);
		RELEASE_Z(audio_source_if);
	}

	if (video_source_if)
	{
		video_source_if->lpVtbl->Shutdown(video_source_if);
		RELEASE_Z(video_source_if);
	}

	if (color_transform_if)
	{	
		MFShutdownObject((IUnknown*) color_transform_if);
		RELEASE_Z(color_transform_if);
	}
		
	if (video_compr_transform_if)
	{
		MFShutdownObject((IUnknown*) video_compr_transform_if);
		RELEASE_Z(video_compr_transform_if);
	}
		
	if (audio_compr_transform_if)
	{
		MFShutdownObject((IUnknown*) audio_compr_transform_if);
		RELEASE_Z(audio_compr_transform_if);
	}

	if (media_sink_if)
	{
		media_sink_if->lpVtbl->Shutdown(media_sink_if);
		RELEASE_Z(media_sink_if);
	}

	RELEASE_Z(video_display_control_if); // @@@ possible concurrent usage from another thread
	
	if (media_session_if)
	{
		media_session_if->lpVtbl->Shutdown(media_session_if);
		RELEASE_Z(media_session_if);
	}

	// Exit thread
	return 0;
}

void start_session (int topo_type)
{
	IMFTopology* topology_if;
	
	topology_if = build_topology(topo_type);
	
	session_control_thread = CreateThread(0, 0, session_control_proc, (void*) topology_if, 0, 0);
}

void start_photo_capture (void)
{
	// Check if a session is already running
	if (session_control_thread)
		return;
	
	// Show video preview and prepare to grab frames
	start_session(PHOTO_CAPTURE_TOPO);
}

void start_video_framing (void)
{
	// Check if a session is already running
	if (session_control_thread)
		return;

	// Show video preview
	start_session(VIDEO_FRAMING_TOPO);
}

void start_video_capture (void)
{
	// Check if a session is already running
	if (session_control_thread)
		return;

	// Show video preview and prepare to output to a mp4 file
	start_session(VIDEO_CAPTURE_TOPO);
}

void start_audio_capture (void)
{
	// Check if a session is already running
	if (session_control_thread)
		return;

	// Prepare to capture audio
	start_session(AUDIO_CAPTURE_TOPO);
}

void start_audio_playback (void)
{
	// Check if a session is already running
	if (session_control_thread)
		return;

	// Prepare to play audio
	start_session(AUDIO_PLAYBACK_TOPO);
}

LONGLONG end_active_session (void)
{
	HRESULT hr;
	LONGLONG session_duration = 0;

	if (media_session_if)
	{
		session_duration = MFGetSystemTime() - start_time;

		hr = media_session_if->lpVtbl->Stop(media_session_if);
	
		// Wait until the session control thread exits
		WaitForSingleObject(session_control_thread, INFINITE);
	}

	MFShutdown();

	session_control_thread = 0;

	return session_duration;
}

void stop_video_capture (void)
{
	LONGLONG duration = end_active_session();

	fix_mp4_duration(last_recorded_file_name_full, duration);
}

void stop_video_framing (void)
{
	end_active_session();
}

void snap_picture (void)
{
	// Raise frame grab flag
	grab_first_available_frame = TRUE;
}

//-------------------------------------------------------------------------------------------------

#define PREVIEW_WINDOW_CLASS	L"Preview Area"

LRESULT CALLBACK PreviewWndProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	// WindowProc for the simple window where the video preview goes
	int width, height;

	switch (uMsg)
	{
		case WM_SIZE:
			width = LOWORD(lParam);
			height = HIWORD(lParam);

			// Resize video preview area
			camera_resize_window(width, height);
			break;

		case WM_RBUTTONDOWN:
			// Display the configuration dialog if a right click is detected
			SendMessage(GetParent(hWnd), WM_COMMAND, ID_PARAMETERS, 0);
			break;

		default:
			break;
	}

	return DefWindowProc(hWnd, uMsg, wParam, lParam); 
}

//-------------------------------------------------------------------------------------------------

#define CAPTURE_WINDOW_CLASS	L"Cordova Capture Window"
#define RIGHT_MARGIN	32

#define TOOLBAR_ID	1

#define NUM_BUTTONS	5
#define NUM_IMAGES	5

#define BUTTON_WIDTH	24
#define BUTTON_HEIGHT	25
#define BITMAP_WIDTH	120
#define BITMAP_HEIGHT	24

HWND hToolBar;

TBBUTTON button_array_video_framing[] = 
{
	{ 0, ID_START_VIDEO,TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON },
	{ 1, ID_STOP_VIDEO,	TBSTATE_ENABLED | TBSTATE_WRAP | TBSTATE_HIDDEN, BTNS_BUTTON },
	{ 3, ID_PARAMETERS,	TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON },
	{ 4, ID_RETURN,		TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON }
};

TBBUTTON button_array_video_capture[] = 
{
	{ 0, ID_START_VIDEO,TBSTATE_ENABLED | TBSTATE_WRAP | TBSTATE_HIDDEN, BTNS_BUTTON },
	{ 1, ID_STOP_VIDEO,	TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON },
	{ 3, ID_PARAMETERS,	TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON },
	{ 4, ID_RETURN,		TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON }
};

TBBUTTON button_array_photo[] = 
{
	{ 2, ID_TAKE_PHOTO,	TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON },
	{ 3, ID_PARAMETERS,	TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON },
	{ 4, ID_RETURN,		TBSTATE_ENABLED | TBSTATE_WRAP, BTNS_BUTTON }
};

//-------------------------------------------------------------------------------------------------

int populate_capture_device_list (HWND hList, const GUID* category, wchar_t* suggested_name)
{	
	HRESULT hr;
	IMFAttributes* attributes_if = 0;
	IMFActivate** activate_array = 0;
	UINT32 count = 0;
	UINT32 i;
	int selection = 0;

    // Create a container for enumeration criteria
    hr = MFCreateAttributes(&attributes_if, 1);
    
	// List video capture devices    
    hr = attributes_if->lpVtbl->SetGUID(attributes_if, &MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE, category);
    hr = MFEnumDeviceSources(attributes_if, &activate_array, &count);

	// Release attributes
	RELEASE(attributes_if);

	// List names
	for (i=0; i<count; i++)
	{
		LPWSTR name = 0;
			
		hr = activate_array[i]->lpVtbl->GetAllocatedString(activate_array[i], &MF_DEVSOURCE_ATTRIBUTE_FRIENDLY_NAME, &name, 0);

		ComboBox_AddString(hList, name);

		if (!wmemcmp(name, suggested_name, wcslen(name)))
					selection = i;

       	CoTaskMemFree(name);
	}

   	
	// Release array elements
	for (i=0; i<count; i++)
	{
		RELEASE(activate_array[i]);
	}

	CoTaskMemFree(activate_array);

	ComboBox_SetCurSel(hList, selection);

	return count;
}

void populate_video_encoder_list (HWND hList)
{
	HRESULT hr;
	DWORD count = 0;
	DWORD i;
	IMFActivate** activate_array = 0;
	DWORD additional_flags = MFT_ENUM_FLAG_HARDWARE;
	GUID mft_category;
	MFT_REGISTER_TYPE_INFO codec;
	int selection = 0;

	mft_category =			MFT_CATEGORY_VIDEO_ENCODER;
	codec.guidMajorType =	MFMediaType_Video;
	codec.guidSubtype =		MFVideoFormat_H264;

	hr = MFTEnumEx(mft_category, MFT_ENUM_FLAG_SYNCMFT | MFT_ENUM_FLAG_ASYNCMFT | additional_flags | MFT_ENUM_FLAG_SORTANDFILTER,  0, &codec, &activate_array, &count);

	// List names
	for (i=0; i<count; i++)
	{
		LPWSTR name = 0;
			
		hr = activate_array[i]->lpVtbl->GetAllocatedString(activate_array[i], &MFT_FRIENDLY_NAME_Attribute, &name, 0);

		if (!wmemcmp(name, preferred_video_encoder, wcslen(name)))
			selection = i;

		ComboBox_AddString(hList, name);

       	CoTaskMemFree(name);
	}

	for (i=0; i<count; i++)
		RELEASE(activate_array[i]);

	ComboBox_SetCurSel(hList, selection);

	CoTaskMemFree(activate_array);
}

//-------------------------------------------------------------------------------------------------

void populate_resolution_list(HWND hList, wchar_t* preferred_resolution, wchar_t* preferred_device_name)
{
	HRESULT hr;	
	IMFMediaSource* source_if = 0;
	IMFPresentationDescriptor* pres_descr_if = 0;
	BOOL selected;
	DWORD stream_count;
	DWORD i;
	GUID media_type;
	IMFMediaTypeHandler* cam_type_handler_if = 0;
	IMFStreamDescriptor* stream_desc_if = 0;
	wchar_t buf[80];
	int selected_index = -1;
	DWORD count;
	DWORD w, h;
	DWORD fr1, fr2;
	GUID format;
	int buf_len;
	UINT32 interlace_mode = 0;

	ComboBox_ResetContent(hList);

	select_video_capture_device(&source_if, preferred_device_name);

	if (!source_if)
		return;
	
	hr = source_if->lpVtbl->CreatePresentationDescriptor(source_if, &pres_descr_if);

	hr = pres_descr_if->lpVtbl->GetStreamDescriptorCount(pres_descr_if, &stream_count);

	for (i=0; i<stream_count; i++)
	{
		hr = pres_descr_if->lpVtbl->GetStreamDescriptorByIndex(pres_descr_if, i, &selected, &stream_desc_if);

		if (selected)
		{
			hr = stream_desc_if->lpVtbl->GetMediaTypeHandler(stream_desc_if, &cam_type_handler_if);
			hr = cam_type_handler_if->lpVtbl->GetMajorType(cam_type_handler_if, &media_type);

			if (IsEqualGUID(&media_type, &MFMediaType_Video))
			{
				// Enumerate supported media types
				{
					cam_type_handler_if->lpVtbl->GetMediaTypeCount(cam_type_handler_if, &count);
					
					for (i=0; i<count; i++)
					{
						cam_type_handler_if->lpVtbl->GetMediaTypeByIndex(cam_type_handler_if, i, &cam_config_if);

						hr = cam_config_if->lpVtbl->GetGUID(cam_config_if, &MF_MT_SUBTYPE, &format);
						hr = cam_config_if->lpVtbl->GetUINT64(cam_config_if, &MF_MT_FRAME_SIZE, &frame_size);
						hr = cam_config_if->lpVtbl->GetUINT64(cam_config_if, &MF_MT_FRAME_RATE, &frame_rate);
						hr = cam_config_if->lpVtbl->GetUINT32(cam_config_if, &MF_MT_INTERLACE_MODE, &interlace_mode);

						if (interlace_mode == MFVideoInterlace_Progressive)
						{
							w = frame_size >> 32;
							h = (DWORD) frame_size;
							fr1 = frame_rate >> 32;
							fr2 = (DWORD) frame_rate;

							buf_len = wsprintf(buf, L"%d x %d @ %d fps %s", w, h, fr1/fr2, identify_format(&format)/*, interlace_mode == 2 ? L'p' : L'i'*/);
					
							ComboBox_AddString(hList, buf);

							if (!wmemcmp(buf, preferred_resolution, buf_len))
							{
								selected_index = i;
								ComboBox_SetCurSel(hList, i);
							}
						}
						RELEASE(cam_config_if);
					}
				}
			}

			RELEASE(cam_type_handler_if);
		}

		RELEASE(stream_desc_if);

		// If no match was found with requested resolution, select first available resolution
		if (selected_index == -1)
			ComboBox_SetCurSel(hList, 0);
	}

	RELEASE(pres_descr_if);
}

//-------------------------------------------------------------------------------------------------

BOOL update_selected_video_capture_device(wchar_t* new_val)
{
	int len = wcslen(new_val);

	if (len > MAX_DEVICE_NAME_LEN)
		len = MAX_DEVICE_NAME_LEN;
		
	if (wmemcmp(new_val, preferred_video_capture_dev, len))
	{
		wmemcpy(preferred_video_capture_dev, new_val, len);
		preferred_video_capture_dev[len] = 0;
		save_pref(PREF_VIDEO_DEVICE, preferred_video_capture_dev);
		return TRUE;
	}

	return FALSE;
}


BOOL update_selected_audio_capture_device(wchar_t* new_val)
{
	int len = wcslen(new_val);

	if (len > MAX_DEVICE_NAME_LEN)
		len = MAX_DEVICE_NAME_LEN;
		
	if (wmemcmp(new_val, preferred_audio_capture_dev, len))
	{
		wmemcpy(preferred_audio_capture_dev, new_val, len);
		preferred_audio_capture_dev[len] = 0;
		save_pref(PREF_AUDIO_DEVICE, preferred_audio_capture_dev);
		return TRUE;
	}

	return FALSE;
}


BOOL update_selected_resolution(wchar_t* new_val)
{
	wchar_t* pref_name;
	wchar_t* pref_val;

	int len = wcslen(new_val);

	if (len > MAX_DEVICE_NAME_LEN)
		len = MAX_DEVICE_NAME_LEN;

	if (current_action_code == ACTION_PHOTO_CAPTURE)
	{
		pref_name = PREF_PHOTO_RESOLUTION;
		pref_val = preferred_photo_resolution;
	}
	else
	{
		pref_name = PREF_VIDEO_RESOLUTION;
		pref_val = preferred_video_resolution;
	}

	if (wmemcmp(new_val, pref_val, len))
	{
		wmemcpy(pref_val, new_val, len);
		pref_val[len] = 0;
		save_pref(pref_name, pref_val);
		return TRUE;
	}

	return FALSE;
}


BOOL update_selected_video_encoder(wchar_t* new_val)
{
	int len = wcslen(new_val);

	if (len > MAX_DEVICE_NAME_LEN)
		len = MAX_DEVICE_NAME_LEN;
		
	if (wmemcmp(new_val, preferred_video_encoder, len))
	{
		wmemcpy(preferred_video_encoder, new_val, len);
		preferred_video_encoder[len] = 0;
		save_pref(PREF_VIDEO_ENCODER, preferred_video_encoder);
		return TRUE;
	}

	return FALSE;
}


//-------------------------------------------------------------------------------------------------


LRESULT CALLBACK CaptureSettingsDialogProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	BOOL refresh_required;
	wchar_t buf[MAX_DEVICE_NAME_LEN+1];
	HWND hParent;
	RECT parent_rect;
	RECT dialog_rect;
	RECT rc;
	int video_count;
	int audio_count;
		
	switch (uMsg)
	{
		case WM_INITDIALOG:
			video_count = populate_capture_device_list(GetDlgItem(hWnd, IDC_Camera), &MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE_VIDCAP_GUID, preferred_video_capture_dev);
			audio_count = populate_capture_device_list(GetDlgItem(hWnd, IDC_Microphone), &MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE_AUDCAP_GUID, preferred_audio_capture_dev);
			populate_resolution_list(GetDlgItem(hWnd, IDC_Resolution), current_action_code == ACTION_PHOTO_CAPTURE ? preferred_photo_resolution : preferred_video_resolution, preferred_video_capture_dev);
			populate_video_encoder_list(GetDlgItem(hWnd, IDC_VideoEncoder));

			if (video_count == 0)
			{
				EnableWindow(GetDlgItem(hWnd, IDC_Camera), FALSE);
				EnableWindow(GetDlgItem(hWnd, IDC_Resolution), FALSE);
				EnableWindow(GetDlgItem(hWnd, IDC_VideoEncoder), FALSE);
			}

			if (audio_count == 0)
			{
				EnableWindow(GetDlgItem(hWnd, IDC_Microphone), FALSE);
			}

			// Disable audio an encoder settings in photo mode
			if (current_action_code == ACTION_PHOTO_CAPTURE)
			{
				EnableWindow(GetDlgItem(hWnd, IDC_Microphone), FALSE);
				EnableWindow(GetDlgItem(hWnd, IDC_VideoEncoder), FALSE);
			}
			
			// Move the dialog towards the right edge of the window, near the toolbar

			hParent = GetParent(hWnd);

			GetWindowRect(hParent, &parent_rect); 
			GetWindowRect(hWnd, &dialog_rect); 
			rc = parent_rect; 

			OffsetRect(&dialog_rect, -dialog_rect.left, -dialog_rect.top); 
			OffsetRect(&rc, -rc.left, -rc.top); 
			OffsetRect(&rc, -dialog_rect.right, -dialog_rect.bottom); 

			SetWindowPos(hWnd, HWND_TOP, parent_rect.left + rc.right*15/16, parent_rect.top + rc.bottom/8, 0, 0, SWP_NOSIZE); 

			return TRUE;

		case WM_COMMAND:
			switch (wParam)
			{
				case ((CBN_SELCHANGE << 16) | IDC_Camera):
					// New camera selected ; update resolution list
					buf[0] = 0;
					ComboBox_GetText(GetDlgItem(hWnd, IDC_Camera), buf, MAX_DEVICE_NAME_LEN+1);
					populate_resolution_list(GetDlgItem(hWnd, IDC_Resolution), current_action_code == ACTION_PHOTO_CAPTURE ? preferred_photo_resolution : preferred_video_resolution, buf);
					break;
				
				case IDOK:
					refresh_required = FALSE;
					
					buf[0] = 0;
					ComboBox_GetText(GetDlgItem(hWnd, IDC_Camera), buf, MAX_DEVICE_NAME_LEN+1);
					refresh_required |= update_selected_video_capture_device(buf);
					
					buf[0] = 0;
					ComboBox_GetText(GetDlgItem(hWnd, IDC_Microphone), buf, MAX_DEVICE_NAME_LEN+1);
					refresh_required |= update_selected_audio_capture_device(buf);

					buf[0] = 0;
					ComboBox_GetText(GetDlgItem(hWnd, IDC_VideoEncoder), buf, MAX_DEVICE_NAME_LEN+1);
					refresh_required |= update_selected_video_encoder(buf);

					buf[0] = 0;
					ComboBox_GetText(GetDlgItem(hWnd, IDC_Resolution), buf, MAX_DEVICE_NAME_LEN+1);
					refresh_required |= update_selected_resolution(buf);

					// The function returns 1 if settings have been modified
					EndDialog(hWnd, refresh_required);
					return FALSE;

				case IDCANCEL:
					EndDialog(hWnd, 0);
					return FALSE;
			}

			return TRUE;
	}
	
	return FALSE;
}


LRESULT CALLBACK CaptureWndProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	// WindowProc for the video/photo capture window
	int width, height;
	int num_buttons;
	TBBUTTON* selected_toolbar;

	switch (uMsg)
	{
		case WM_CREATE:
			{
				WNDCLASSEX wc = { sizeof(WNDCLASSEX), CS_HREDRAW | CS_VREDRAW, PreviewWndProc, 0, 0, 0, 0, LoadCursor(NULL, IDC_ARROW), GetStockObject(BLACK_BRUSH), 0, PREVIEW_WINDOW_CLASS };
				
				RegisterClassEx(&wc);
			}
			
			hPreviewWnd = CreateWindow(PREVIEW_WINDOW_CLASS, L"", WS_CHILD | WS_VISIBLE, 0, 0, 0, 0, hWnd, 0, 0, 0);

			switch (current_action_code)
			{
				case ACTION_PHOTO_CAPTURE:
					selected_toolbar = button_array_photo;
					num_buttons = sizeof(button_array_photo)/sizeof(TBBUTTON);
					break;

				case ACTION_VIDEO_FRAMING:
					selected_toolbar = button_array_video_framing;
					num_buttons = sizeof(button_array_video_framing)/sizeof(TBBUTTON);
					break;

				case ACTION_VIDEO_CAPTURE:	// Not sure this will be used ; probably better start with framing
					selected_toolbar = button_array_video_capture;
					num_buttons = sizeof(button_array_video_capture)/sizeof(TBBUTTON);
					break;

				default:
					selected_toolbar = 0;
					num_buttons = 0;
					break;

			}

			// We have a vertical toolbar on the right side of the video preview area
			hToolBar = CreateToolbarEx(hWnd, WS_VISIBLE | WS_CHILD | CCS_RIGHT | CCS_NOMOVEX | CCS_NOMOVEY | CCS_NOPARENTALIGN | CCS_NORESIZE | TBSTYLE_TRANSPARENT | TBSTYLE_FLAT,
							TOOLBAR_ID, NUM_IMAGES, GetModuleHandle(0), IDB_ToolBar, selected_toolbar, num_buttons,
							BUTTON_WIDTH, BUTTON_HEIGHT, BITMAP_WIDTH, BITMAP_HEIGHT, sizeof(TBBUTTON));

			return 0;

		case WM_COMMAND:
			switch (wParam)
			{
				case ID_START_VIDEO:
					stop_video_framing();
					SendMessage(hToolBar, TB_HIDEBUTTON, ID_START_VIDEO, TRUE);
					SendMessage(hToolBar, TB_HIDEBUTTON, ID_STOP_VIDEO, FALSE);
					SendMessage(hToolBar, TB_ENABLEBUTTON, ID_PARAMETERS, FALSE);
					start_video_capture();
					break;

				case ID_STOP_VIDEO:
					stop_video_capture();
					SendMessage(hToolBar, TB_HIDEBUTTON, ID_STOP_VIDEO, TRUE);
					SendMessage(hToolBar, TB_HIDEBUTTON, ID_START_VIDEO, FALSE);
					SendMessage(hToolBar, TB_ENABLEBUTTON, ID_PARAMETERS, TRUE);
					start_video_framing();
					break;

				case ID_TAKE_PHOTO:
					snap_picture();
					break;

				case ID_PARAMETERS:
					end_active_session();
					DialogBox(GetModuleHandle(0), MAKEINTRESOURCE(IDD_CaptureSettings), hWnd, CaptureSettingsDialogProc);
					if (current_action_code == ACTION_PHOTO_CAPTURE)
						start_photo_capture();
					else
						start_video_framing();
					break;

				case ID_RETURN:
					end_active_session();
					DestroyWindow(hWnd);
					break;
			}
			return 0;

		case WM_DESTROY:
			DestroyWindow(hToolBar);
			DestroyWindow(hPreviewWnd);
			hCaptureWnd = 0;
			hPreviewWnd = 0;
			hToolBar = 0;
			break;
		
		case WM_SIZE:
			width = LOWORD(lParam);
			height = HIWORD(lParam);

			if (width > RIGHT_MARGIN)
				width = width - RIGHT_MARGIN;
			else
				width = 0;

			// Resize video preview area
			SetWindowPos(hPreviewWnd, 0, 0, 0, width, height, SWP_NOCOPYBITS | SWP_NOMOVE | SWP_NOZORDER);
			
			// Also reposition and resize toolbar ; shift up to avoid disgracious border
			SetWindowPos(hToolBar, 0, width, -2, RIGHT_MARGIN, height, SWP_NOZORDER);
			return 0;

		default:
			break;
	}

	return DefWindowProc(hWnd, uMsg, wParam, lParam); 
}


HWND setup_capture_window (HWND hParent, BOOL video_mode)
{
	RECT rc;
	WNDCLASSEX wc = { sizeof(WNDCLASSEX), CS_HREDRAW | CS_VREDRAW, CaptureWndProc, 0, 0, 0, 0, LoadCursor(NULL, IDC_ARROW), GetStockObject(BLACK_BRUSH), 0, CAPTURE_WINDOW_CLASS };

	RegisterClassEx(&wc);

	GetClientRect(hParent, &rc);

	if (video_mode)
		current_action_code = ACTION_VIDEO_FRAMING;
	else
		current_action_code = ACTION_PHOTO_CAPTURE;
	
	hCaptureWnd = CreateWindow(CAPTURE_WINDOW_CLASS, L"", WS_CHILD | WS_VISIBLE, 0, 0, rc.right, rc.bottom, hParent, 0, 0, 0);

	BringWindowToTop(hCaptureWnd);

	return hCaptureWnd;
}

//-------------------------------------------------------------------------------------------------
 

static int sgsc_ref_count = 0;

HRESULT STDMETHODCALLTYPE SGSC_QueryInterface(IMFSampleGrabberSinkCallback2 * This, REFIID riid, void **ppvObject)
{
	if (IsEqualIID(riid,&IID_IUnknown) || IsEqualIID(riid,&IID_IMFSampleGrabberSinkCallback) ||
		IsEqualIID(riid,&IID_IMFSampleGrabberSinkCallback2) || IsEqualIID(riid,&IID_IMFClockStateSink)) 
    {
		*ppvObject = &sgsc;
		sgsc.lpVtbl->AddRef(&sgsc);
		return NOERROR;
	}

	*ppvObject = 0;
	return E_NOINTERFACE;
}
        
ULONG STDMETHODCALLTYPE SGSC_AddRef(IMFSampleGrabberSinkCallback2 * This)
{
	sgsc_ref_count++;
	
	return sgsc_ref_count;
}
        
ULONG STDMETHODCALLTYPE SGSC_Release(IMFSampleGrabberSinkCallback2 * This)
{
	sgsc_ref_count--;

	return sgsc_ref_count;
}
        
HRESULT STDMETHODCALLTYPE SGSC_OnClockStart(IMFSampleGrabberSinkCallback2 * This, MFTIME hnsSystemTime, LONGLONG llClockStartOffset)
{
	return S_OK;
}
        
HRESULT STDMETHODCALLTYPE SGSC_OnClockStop(IMFSampleGrabberSinkCallback2 * This, MFTIME hnsSystemTime)
{
	return S_OK;
}
        
HRESULT STDMETHODCALLTYPE SGSC_OnClockPause(IMFSampleGrabberSinkCallback2 * This, MFTIME hnsSystemTime)
{
	return S_OK;
}
        
HRESULT STDMETHODCALLTYPE SGSC_OnClockRestart(IMFSampleGrabberSinkCallback2 * This, MFTIME hnsSystemTime)
{
	return S_OK;
}
        
HRESULT STDMETHODCALLTYPE SGSC_OnClockSetRate(IMFSampleGrabberSinkCallback2 * This, MFTIME hnsSystemTime, float flRate)
{
	return S_OK;
}
        
HRESULT STDMETHODCALLTYPE SGSC_OnSetPresentationClock(IMFSampleGrabberSinkCallback2 * This, IMFPresentationClock *pPresentationClock)
{
	return S_OK;
}
        
HRESULT STDMETHODCALLTYPE SGSC_OnProcessSample(IMFSampleGrabberSinkCallback2 * This, REFGUID guidMajorMediaType, DWORD dwSampleFlags,
	LONGLONG llSampleTime, LONGLONG llSampleDuration, const BYTE *pSampleBuffer, DWORD dwSampleSize)
{
	return E_NOTIMPL;	// Superseded by OnProcessSampleEx (see below)
}
        
HRESULT STDMETHODCALLTYPE SGSC_OnShutdown(IMFSampleGrabberSinkCallback2 * This)
{
	// Make sure there is no left over command from the current session
	grab_first_available_frame = FALSE;
	return S_OK;
}

HRESULT STDMETHODCALLTYPE  SGSC_OnProcessSampleEx (IMFSampleGrabberSinkCallback2 * This, REFGUID guidMajorMediaType, DWORD dwSampleFlags,
    LONGLONG llSampleTime, LONGLONG llSampleDuration, const BYTE *pSampleBuffer, DWORD dwSampleSize, IMFAttributes *pAttributes)
{
	if (grab_first_available_frame)
	{
		SYSTEMTIME t;

		GetLocalTime(&t);
		swprintf(last_recorded_file_name, MAX_FILE_NAME_LEN, L"%d%02d%02d-%02d%02d%02d.jpg", t.wYear, t.wMonth, t.wDay, t.wHour, t.wMinute, t.wSecond);
		swprintf(last_recorded_file_name_full, MAX_FILE_NAME_LEN, L"%s%s", temp_directory_win, last_recorded_file_name);
		last_recorded_file_name_full[MAX_FILE_NAME_LEN] = 0;

		if (mjpeg_mode)
		{
			// Direct JPEG frames
			HANDLE h = CreateFile(last_recorded_file_name_full, GENERIC_WRITE, 0, 0, CREATE_ALWAYS, 0, 0);
			DWORD written = 0;
			WriteFile(h, pSampleBuffer, dwSampleSize, &written, 0);
			CloseHandle(h);
		}
		else
		{
			// RGB 24 bpp input
			DWORD width = frame_size >> 32;
			DWORD height = (DWORD) frame_size;

			save_bitmap_as_jpeg(width, height, (unsigned char*) pSampleBuffer, dwSampleSize, last_recorded_file_name_full, scan_len);
		}
	
		// Lower flag and don't try capturing another photo until it gets raised again
		grab_first_available_frame = FALSE;
	}
		
	return S_OK;
}


// IMFSampleGrabberSinkCallback2 vtable
static IMFSampleGrabberSinkCallback2Vtbl sgsc_vtable =
{
	SGSC_QueryInterface,
	SGSC_AddRef, 
	SGSC_Release,
	SGSC_OnClockStart,
	SGSC_OnClockStop,
	SGSC_OnClockPause,
	SGSC_OnClockRestart,
	SGSC_OnClockSetRate,
	SGSC_OnSetPresentationClock,
	SGSC_OnProcessSample,
	SGSC_OnShutdown,
	SGSC_OnProcessSampleEx,
};


void setup_capture(void)
{
	wchar_t* cursor;
	
	load_pref(PREF_VIDEO_DEVICE, preferred_video_capture_dev);
	load_pref(PREF_AUDIO_DEVICE, preferred_audio_capture_dev);
	load_pref(PREF_VIDEO_ENCODER, preferred_video_encoder);
	load_pref(PREF_VIDEO_RESOLUTION, preferred_video_resolution);
	load_pref(PREF_PHOTO_RESOLUTION, preferred_photo_resolution);

	// One-time initialization, required before capture services can be used
	sgsc.lpVtbl = &sgsc_vtable;

	// Locate temp directory and make a HTML friendly of it
	
	GetTempPath(MAX_FILE_NAME_LEN - 16, temp_directory_win);
	swprintf(temp_directory_url, MAX_FILE_NAME_LEN + 7, L"file://%s", temp_directory_win);

	cursor = temp_directory_url;

	while (*cursor)
	{
		if (*cursor == L'\\')
			*cursor = '/';
		
		cursor++;
	}

	// The Win32 version includes a \ at the end, which is converted into / for the HTML version
}

BSTR last_callback_id;

void notify_capture_result (void)
{
	wchar_t reply[30 + MAX_FILE_NAME_LEN + 1];

	// Send back our reply to the JS side
	swprintf(reply, sizeof(reply)/sizeof(reply[0]), L"[{fullPath: '%s%s'}]", temp_directory_url, last_recorded_file_name);
	
	cordova_success_callback(last_callback_id, FALSE, reply);

	SysFreeString(last_callback_id);
	last_callback_id = 0;
}

HRESULT camera_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if (!wcscmp(action, L"getPicture"))
	{
		last_callback_id = SysAllocString(callback_id);
		setup_capture_window(hWnd, FALSE);
		start_photo_capture();
		return S_OK;
	}

	return DISP_E_MEMBERNOTFOUND;
}

HRESULT capture_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if (!wcscmp(action, L"captureImage"))
	{
		last_callback_id = SysAllocString(callback_id);
		setup_capture_window(hWnd, FALSE);
		start_photo_capture();
		return S_OK;
	}
	
	if (!wcscmp(action, L"captureVideo"))
	{
		last_callback_id = SysAllocString(callback_id);
		setup_capture_window(hWnd, TRUE);
		start_video_framing();
		return S_OK;
	}
	
	if (!wcscmp(action, L"captureAudio"))
	{
		last_callback_id = 0;
		return S_OK;
	}

	return DISP_E_MEMBERNOTFOUND;
}

DEFINE_CORDOVA_MODULE(Camera, L"Camera", camera_exec, NULL, NULL)
DEFINE_CORDOVA_MODULE(Capture, L"Capture", capture_exec, NULL, NULL)


// @@@ need to handle device lost events - MF_DEVSOURCE_ATTRIBUTE_SOURCE_TYPE_VIDCAP_SYMBOLIC_LINK

// @@@ feedback for key presses ?

