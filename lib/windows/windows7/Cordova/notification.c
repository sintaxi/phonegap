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

#include <stdlib.h>

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <wchar.h>

#include "notification.h"
#include "json.h"

extern HWND	hWnd;

#define FONT_SIZE	10
#define FONT_NAME	L"Arial"
#define MAX_BUTTONS	10
#define ID_BASE		100

LRESULT CALLBACK NotificationDialogProc (HWND hDlg, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	int btn_id;
	HWND hParent;
	RECT parent_rect;
	RECT dialog_rect;
	RECT rc;

	switch (uMsg)
	{
		case WM_INITDIALOG:

			// Center the dialog within parent window
			hParent = GetParent(hDlg);

			GetWindowRect(hParent, &parent_rect);
			GetWindowRect(hDlg, &dialog_rect);
			rc = parent_rect;

			OffsetRect(&dialog_rect, -dialog_rect.left, -dialog_rect.top);
			OffsetRect(&rc, -rc.left, -rc.top);
			OffsetRect(&rc, -dialog_rect.right, -dialog_rect.bottom);

			SetWindowPos(hDlg, HWND_TOP, parent_rect.left + rc.right*1/2, parent_rect.top + rc.bottom*1/2, 0, 0, SWP_NOSIZE);
			return TRUE;

		case WM_COMMAND:
			if (wParam == IDCANCEL)
			{
				EndDialog(hDlg, -1);
				return FALSE;
			}
			else
			{
				btn_id = (SHORT) (LOWORD(wParam));
				EndDialog(hDlg, btn_id - ID_BASE);	// Use large button IDs to avoid collisions with IDOK, IDCANCEL and friends 
				return TRUE;
			}
	
		default:
			return FALSE;
	}
}


// Align an USHORT pointer to a 4 bytes aligned boundary, padding with zero if necessary
#define ALIGN4(cursor)	if (((BYTE) cursor) & 2) *cursor++ = 0;
   
// See http://msdn.microsoft.com/en-us/library/ms645394%28v=vs.85%29.aspx


LRESULT DisplayMessage(wchar_t* title, int title_len, wchar_t* message, int message_len, wchar_t* button_label[], int button_len[], int num_buttons)
{
    DLGTEMPLATE* dlg_template;
    DLGITEMTEMPLATE* item_template;
    WORD* cursor;	// 16 bits words pointer
    LRESULT ret_code;
	void* buf;
	int i;
	int next_x;
	int button_width = 80;	// Width of a button
	int button_gap = 6;	// Width of the space separating two buttons
	int left_margin = 10;	// Left dialog margin
	int right_margin = 10;	// Right dialog margin
	int top_margin = 10;
	int bottom_margin = 10;
	int static_height = 40;	// Height of the space where static text is displayed
	int static_to_buttons_margin = num_buttons > 0 ? 5 : 0;
	int button_height = num_buttons > 0 ? 15 : 0;
	int num_gaps = num_buttons ? num_buttons -1 : 0;
	int static_width = num_buttons ? num_buttons * button_width + button_gap * num_gaps : 80;
	int buf_len;
	int font_len = wcslen(FONT_NAME);

	// Compute length of work buffer and allocate it
	buf_len = sizeof(DLGTEMPLATE) + 4 + title_len + 1 + font_len + 1 + message_len + 1 + sizeof(DLGITEMTEMPLATE) + 4 + 2 + num_buttons * sizeof(DLGITEMTEMPLATE) + 
				+ 100; // Allow for into account possible alignment padding as well as extra fields (class atoms, user data)

	for (i=0; i<num_buttons; i++)
		buf_len += button_len[i] + 1;	

	buf = malloc(buf_len);

    dlg_template = (DLGTEMPLATE*) buf;
 
    // Dialog header
 
    dlg_template->style = WS_POPUP | WS_BORDER | WS_SYSMENU | DS_MODALFRAME | WS_CAPTION | DS_SETFONT;
	dlg_template->dwExtendedStyle = 0;
    dlg_template->cdit = 1 + num_buttons;         // Number of controls
    dlg_template->x  = 0;			// In Dialog Box Units
	dlg_template->y  = 0;	
    dlg_template->cx = left_margin + static_width + right_margin;
	dlg_template->cy = top_margin + static_height + static_to_buttons_margin + button_height + bottom_margin;

    cursor = (WORD*)(dlg_template + 1);	// Point past DLGTEMPLATE structure
    *cursor++ = 0;            // Menu
    *cursor++ = 0;            // Default Dialog class

    // Copy title, add NUL and shift cursor
	wmemcpy(cursor, title, title_len);
	cursor += title_len;
	*cursor++ = 0;

	// Type point and font name (as DS_FONT was specified)
	*cursor++ = FONT_SIZE;
	wmemcpy(cursor, FONT_NAME, font_len);
	cursor += font_len;
	*cursor++ = 0;

	// Item templates need to be DWORD aligned
	ALIGN4(cursor);

	// Static control

    item_template = (DLGITEMTEMPLATE*) cursor;
    item_template->style = WS_CHILD | WS_VISIBLE | SS_CENTER;
	item_template->dwExtendedStyle = 0;
	item_template->x  = left_margin;
	item_template->y  = top_margin;
    item_template->cx = static_width;
	item_template->cy = static_height;
    item_template->id = -1;

    // Move past DLGITEMTEMPLATE structure
	cursor = (WORD*)(item_template + 1);
  
	// Static class
	*cursor++ = 0xFFFF;
    *cursor++ = 0x0082;

	// Title
	wmemcpy(cursor, message, message_len);
	cursor += message_len;
	*cursor++ = 0;

    // Empty user data block
	*cursor++ = 0;

	next_x = left_margin;
	
	// Additional controls
	for (i=0; i<num_buttons; i++)
	{
		ALIGN4(cursor);

		item_template = (DLGITEMTEMPLATE*) cursor;
		item_template->style = WS_CHILD | WS_VISIBLE;
		item_template->dwExtendedStyle = 0;
		item_template->x  = next_x;
		item_template->y  = top_margin + static_height + static_to_buttons_margin;
		item_template->cx = button_width;
		item_template->cy = button_height;
		item_template->id = ID_BASE + i;

		next_x += button_width + button_gap;

		// Move past DLGITEMTEMPLATE structure
		cursor = (WORD*)(item_template + 1);
   
		// Button class
		*cursor++ = 0xFFFF;
		*cursor++ = 0x0080;

		// Title
		wmemcpy(cursor, button_label[i], button_len[i]);
		cursor += button_len[i];
		*cursor++ = 0; 
  
		// Empty user data block
		*cursor++ = 0;             
	}

	ret_code = DialogBoxIndirect(GetModuleHandle(0), dlg_template, hWnd, NotificationDialogProc); 
    free(buf); 
    return ret_code; 
}

static HRESULT show_dialog(BSTR callback_id, BSTR args)
{
	wchar_t buf[10];
	int ret_code;
	wchar_t* message = 0;
	wchar_t* buttons = 0;
	wchar_t* title = 0;
	int num_buttons = 0;
	wchar_t* btn_text[MAX_BUTTONS];
	int btn_text_len[MAX_BUTTONS];
	unsigned int cursor = 0;

	JsonArray array;
	JsonItem item;

	// args should be like "["message","title","button1,button2"]"

	// Validate array contents
	if (!json_parse_and_validate_args(args, &array, JSON_VALUE_STRING,
									JSON_VALUE_STRING,
									JSON_VALUE_STRING,
									JSON_VALUE_INVALID)) {
		json_free_args(array);
		return -1;
	}

	// message
	item = json_array_get_first(array);
	message = json_get_string_value(item);

	// title
	item = json_array_get_next(item);
	title = json_get_string_value(item);

	// buttons
	item = json_array_get_next(item);
	buttons = json_get_string_value(item);
	if (*buttons == 0)
		goto button_done; // No button ; consider that a valid use case

button_parsing:

	btn_text[num_buttons] = buttons + cursor;
	btn_text_len[num_buttons] = 0;

	// Search for separator
	while (cursor < wcslen(buttons) && *(buttons + cursor) != L',') {
		cursor++;
		btn_text_len[num_buttons]++;
	}

	num_buttons++;

	cursor++;
	
	if (cursor < wcslen(buttons) && num_buttons < MAX_BUTTONS)
		goto button_parsing;

button_done:

	json_free_args(array);

	ret_code = DisplayMessage(title, wcslen(title), message, wcslen(message), btn_text, btn_text_len, num_buttons);

	if (message)
		free(message);
	if (title)
		free(title);
	if (buttons)
		free(buttons);

	wsprintf(buf, L"%d", ret_code);

	cordova_success_callback(callback_id, FALSE, buf);

	return S_OK;
}

static HRESULT vibrate(BSTR callback_id, BSTR args)
{
	return S_OK;
}

static HRESULT beep(BSTR callback_id, BSTR args)
{
	int count;

	args++; // skip initial '['
	*(args + wcslen(args) - 1) = 0; // remove trailing ']'

	for (count = _wtoi(args); count > 0; count--) {
		MessageBeep(0xFFFFFFFF);
		Sleep(100);
	}

	return S_OK;
}

HRESULT notification_exec(BSTR callback_id, BSTR action, BSTR args, VARIANT *result)
{
	if(!wcscmp(action, L"alert") || !wcscmp(action, L"confirm"))
		return show_dialog(callback_id, args);
	if (!wcscmp(action, L"vibrate"))
		return vibrate(callback_id, args);
	if (!wcscmp(action, L"beep"))
		return beep(callback_id, args);

	return DISP_E_MEMBERNOTFOUND;
}

DEFINE_CORDOVA_MODULE(Notification, L"Notification", notification_exec, NULL, NULL)
