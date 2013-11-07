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
#include <wchar.h>		// Unicode only for us

#define CINTERFACE 1	// Get C definitions for COM header files
#include <oleidl.h>		// IOleClientSite, IOleInPlaceFrame, IOleInPlaceSite
#include <exdisp.h>		// IWebBrowser2
#include <mshtml.h>		// IHTMLDocument2
#include <mshtmhst.h>	// IDocHostUIHandler
#include <exdispid.h>	// DISPID_TITLECHANGE

#include <ipifcons.h>	// Network types

#include <commctrl.h>					// Let's initialize the common controls library
#pragma comment(lib, "comctl32.lib")	// so they can be used with the process

#include "shell.h"
#include "common.h"
#include "device.h"
#include "accel.h"
#include "capture.h"
#include "network.h"
#include "notification.h"
#include "storage.h"
#include "platform.h"
#include "file.h"
#include "filetransfer.h"
#include "compass.h"

//-------------------------------------------------------------------------------------------------

#define NOT_IMPLEMENTED __debugbreak(); OutputDebugStringA(__FUNCTION__); return 0;

IWebBrowser2*			browser_web_if;			// IWebBrowser2 interface to the browser control
IOleObject*				browser_ole_if;			// IOleObject interface to the browser control, required to pass various OLE related parameters
IOleInPlaceObject*		browser_ipo_if;			// IOleInPlaceObject interface to the browser control, required to implement IOleInPlaceSite:OnPosRectChange

IOleClientSite*			browser_cs;
IOleInPlaceSite*		browser_ips;
IOleInPlaceFrame*		browser_ipf;
IDispatch*				browser_dsp;			// Browser event dispatcher
IDocHostUIHandler*		browser_dui;
IDispatch*				browser_ext;
IOleCommandTarget*		browser_oct;

DWORD					browser_dsp_cookie;		// Dispatcher connection id, as returned by the connection point Advise call

IDispatch*				document_dispatch_if;	// Needed to get document interface
IHTMLDocument2*			document_html2_if;		// Needed to get window interface
IHTMLWindow2*			html_window2_if;		// Needed to run scripts

static struct IOleClientSite	clsi;
static struct IOleInPlaceSite	inplsi;
static struct IOleInPlaceFrame	inplfr;
static struct IDispatch			disp;
static struct IDocHostUIHandler	duih;
static struct IDispatch			ext;
static struct IOleCommandTarget oct;

int clsi_ref_count;
int inplsi_ref_count;
int inplfr_ref_count;
int disp_ref_count;
int inplfr_ref_count;
int duih_ref_count;
int ext_ref_count;
int oct_ref_count;

const	wchar_t gate_name[]= L"CordovaExec";
#define DISPID_GATE	8086

#define APP_NAME		L"Cordova Application"
#define BASE_URL		L"www\\index.html"

#define IE_GPU_REG_KEY		L"Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_GPU_RENDERING"		// Registry key enabling GPU acceleration
#define IE_COMPAT_REG_KEY	L"Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_BROWSER_EMULATION"	// Registry key controlling browser version emulation

wchar_t full_path[_MAX_PATH];	// We record our initial current directory name in there

HWND hWnd;			// Our main window handle
extern HWND hCaptureWnd;	// Child window handle, when capturing video

BSTR javascript;	// Small utility object, used whenever invoking a js method

void invoke_js_routine (wchar_t* wcs);

#define STATE_STARTING		0	// Machinery starting
#define STATE_NATIVE_READY	1	// Native Ready event sent
#define STATE_PAUSED		2	// Paused
#define STATE_ENDING		3	// Machinery shutting down

int current_state;	// Rough operating state : not ready / ready / temporarily paused

int skip_title_update = 1;	// Title update skip counter, used to avoid initial "index.html"

// Browser window subclassing
static WNDPROC initial_browser_wnd_proc;
LRESULT CALLBACK BrowserWndProcWrapper(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

//-------------------------------------------------------------------------------------------------

static CordovaModule *module_list = NULL;

static void register_cordova_module(CordovaModule *module)
{
	CordovaModule *item = module_list;

	if (module->init != NULL)
		module->init();

	if (!item) {
		module_list = module;
		return;
	}

	module->next = module_list;
	module_list = module;
}


static void close_cordova_module(CordovaModule *module)
{
	if (module->close != NULL)
		module->close();
}

static void register_cordova_modules()
{
	register_cordova_module(CORDOVA_MODULE(Device));
	register_cordova_module(CORDOVA_MODULE(Camera));
	register_cordova_module(CORDOVA_MODULE(Capture));
	register_cordova_module(CORDOVA_MODULE(Accelerometer));
	register_cordova_module(CORDOVA_MODULE(Network));
	register_cordova_module(CORDOVA_MODULE(Notification));
	register_cordova_module(CORDOVA_MODULE(Storage));
	register_cordova_module(CORDOVA_MODULE(Platform));
	register_cordova_module(CORDOVA_MODULE(File));
	register_cordova_module(CORDOVA_MODULE(FileTransfer));
	register_cordova_module(CORDOVA_MODULE(Compass));
}

static void close_cordova_modules()
{
	close_cordova_module(CORDOVA_MODULE(Device));
	close_cordova_module(CORDOVA_MODULE(Camera));
	close_cordova_module(CORDOVA_MODULE(Capture));
	close_cordova_module(CORDOVA_MODULE(Accelerometer));
	close_cordova_module(CORDOVA_MODULE(Network));
	close_cordova_module(CORDOVA_MODULE(Notification));
	close_cordova_module(CORDOVA_MODULE(Storage));
	close_cordova_module(CORDOVA_MODULE(Platform));
	close_cordova_module(CORDOVA_MODULE(File));
	close_cordova_module(CORDOVA_MODULE(FileTransfer));
	close_cordova_module(CORDOVA_MODULE(Compass));
}

static CordovaModule *find_cordova_module(BSTR module_id)
{
	CordovaModule *item = module_list;

	while (item) {
		if (!wcscmp(item->module_id, module_id))
			return item;
		item = item->next;
	}

	return NULL;
}

static wchar_t *error_string_from_code(CallbackStatus code)
{
	switch (code) {
		case CB_NO_RESULT: return L"cordova.callbackStatus.NO_RESULT";
		case CB_OK: return L"cordova.callbackStatus.OK";
		case CB_CLASS_NOT_FOUND_EXCEPTION: return L"cordova.callbackStatus.CLASS_NOT_FOUND_EXCEPTION";
		case CB_ILLEGAL_ACCESS_EXCEPTION: return L"cordova.callbackStatus.ILLEGAL_ACCESS_EXCEPTION";
		case CB_INSTANTIATION_EXCEPTION: return L"cordova.callbackStatus.INSTANTIATION_EXCEPTION";
		case CB_MALFORMED_URL_EXCEPTION: return L"cordova.callbackStatus.MALFORMED_URL_EXCEPTION";
		case CB_IO_EXCEPTION: return L"cordova.callbackStatus.IO_EXCEPTION";
		case CB_INVALID_ACTION: return L"cordova.callbackStatus.INVALID_ACTION";
		case CB_JSON_EXCEPTION: return L"cordova.callbackStatus.JSON_EXCEPTION";
		default: return L"cordova.callbackStatus.ERROR";
	}
}

void cordova_success_callback(BSTR callback_id, BOOL keep_callback, const wchar_t *message)
{
	wchar_t *status_str = (message == NULL) ? error_string_from_code(CB_NO_RESULT) : error_string_from_code(CB_OK);
	wchar_t *result = L"window.cordova.callbackSuccess('%s',{status:%s,keepCallback:%s,message:%s});";
	wchar_t *buf;
	
	buf = (wchar_t *) malloc(sizeof(wchar_t) * (1 + wcslen(result) + wcslen(callback_id) + wcslen(status_str) + wcslen(L"false") + wcslen(message)));

	wsprintf(buf, result, callback_id, status_str, keep_callback?L"true":L"false", message);
	invoke_js_routine(buf);

	free(buf);
}

void cordova_fail_callback(BSTR callback_id, BOOL keep_callback, CallbackStatus status, const wchar_t *message)
{
	wchar_t *status_str = error_string_from_code(status);
	wchar_t *result = L"window.cordova.callbackError('%s',{status:%s,keepCallback:%s,message:%s});";
	wchar_t *buf;
	
	buf = (wchar_t *) malloc(sizeof(wchar_t) * (1 + wcslen(result) + wcslen(callback_id) + wcslen(status_str) + wcslen(L"false") + wcslen(message)));

	wsprintf(buf, result, callback_id, status_str, keep_callback?L"true":L"false", message);
	invoke_js_routine(buf);

	free(buf);
}

//-------------------------------------------------------------------------------------------------

HRESULT STDMETHODCALLTYPE InPlFr_QueryInterface(IOleInPlaceFrame * This, REFIID riid, void **ppvObject)
{
	NOT_IMPLEMENTED
}

ULONG STDMETHODCALLTYPE InPlFr_AddRef(IOleInPlaceFrame * This)
{
	NOT_IMPLEMENTED
}

ULONG STDMETHODCALLTYPE InPlFr_Release(IOleInPlaceFrame * This)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlFr_GetWindow(IOleInPlaceFrame * This, HWND *phwnd)
{
	*phwnd = hWnd;
	return S_OK;
}

HRESULT STDMETHODCALLTYPE InPlFr_ContextSensitiveHelp(IOleInPlaceFrame * This, BOOL fEnterMode)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlFr_GetBorder(IOleInPlaceFrame * This, LPRECT lprectBorder)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlFr_RequestBorderSpace(IOleInPlaceFrame * This, LPCBORDERWIDTHS pborderwidths)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlFr_SetBorderSpace(IOleInPlaceFrame * This, LPCBORDERWIDTHS pborderwidths)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlFr_SetActiveObject(IOleInPlaceFrame * This, IOleInPlaceActiveObject *pActiveObject, LPCOLESTR pszObjName)
{
	return S_OK;
}

HRESULT STDMETHODCALLTYPE InPlFr_InsertMenus(IOleInPlaceFrame * This, HMENU hmenuShared, LPOLEMENUGROUPWIDTHS lpMenuWidths)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlFr_SetMenu(IOleInPlaceFrame * This, HMENU hmenuShared, HOLEMENU holemenu, HWND hwndActiveObject)
{
	return S_OK;
}

HRESULT STDMETHODCALLTYPE InPlFr_RemoveMenus(IOleInPlaceFrame * This, HMENU hmenuShared)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlFr_SetStatusText(IOleInPlaceFrame * This, LPCOLESTR pszStatusText)
{
	// Status updates
	return S_OK;
}

HRESULT STDMETHODCALLTYPE InPlFr_EnableModeless(IOleInPlaceFrame * This, BOOL fEnable)
{
	// We don't track the modeless flag state, but as this gets called, reply something meaningful
	return S_OK;
}

HRESULT STDMETHODCALLTYPE InPlFr_TranslateAccelerator(IOleInPlaceFrame * This, LPMSG lpmsg, WORD wID)
{
	NOT_IMPLEMENTED
}

//-------------------------------------------------------------------------------------------------

// IOleInPlaceFrame vtable
static IOleInPlaceFrameVtbl inplfr_vtable =
{
	InPlFr_QueryInterface,
	InPlFr_AddRef,
	InPlFr_Release,
	InPlFr_GetWindow,
	InPlFr_ContextSensitiveHelp,
	InPlFr_GetBorder,
	InPlFr_RequestBorderSpace,
	InPlFr_SetBorderSpace,
	InPlFr_SetActiveObject,
	InPlFr_InsertMenus,			// Enables the container to insert menu groups
	InPlFr_SetMenu,				// Adds a composite menu to the window frame containing the object being activated in place
	InPlFr_RemoveMenus,			// Removes a container's menu elements from the composite menu
	InPlFr_SetStatusText,		// Sets and displays status text about the in-place object in the container's frame window status line
	InPlFr_EnableModeless,		// Enables or disables a frame's modeless dialog boxes
	InPlFr_TranslateAccelerator	// Translates accelerator keystrokes intended for the container's frame while an object is active in place
};

//-------------------------------------------------------------------------------------------------

HRESULT STDMETHODCALLTYPE InPlSi_QueryInterface(IOleInPlaceSite * This, REFIID riid, void **ppvObject)
{
	if (IsEqualIID(riid,&IID_IUnknown) || IsEqualIID(riid,&IID_IOleInPlaceSite))
	{
		*ppvObject = browser_ips;
		browser_ips->lpVtbl->AddRef(browser_ips);
		return NOERROR;
	}

	// We get queries for IID_ServiceProvider, IID_IOleCommandTarget

	*ppvObject = 0;
	return E_NOINTERFACE;
}
	
ULONG STDMETHODCALLTYPE InPlSi_AddRef(IOleInPlaceSite * This)
{
	inplsi_ref_count++;

	return inplsi_ref_count;
}

ULONG STDMETHODCALLTYPE InPlSi_Release(IOleInPlaceSite * This)
{
	inplsi_ref_count--;

	ASSERT(inplsi_ref_count >= 0);

	return inplsi_ref_count;
}

HRESULT STDMETHODCALLTYPE InPlSi_GetWindow(IOleInPlaceSite * This, HWND *phwnd)
{
	*phwnd = hWnd;
	return S_OK;
}

HRESULT STDMETHODCALLTYPE InPlSi_ContextSensitiveHelp(IOleInPlaceSite * This, BOOL fEnterMode)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlSi_CanInPlaceActivate(IOleInPlaceSite * This)
{
	return S_OK;	// Allow activation
}

HRESULT STDMETHODCALLTYPE InPlSi_OnInPlaceActivate(IOleInPlaceSite * This)
{
	return S_OK;	// Go ahead and activate object
}

HRESULT STDMETHODCALLTYPE InPlSi_OnUIActivate(IOleInPlaceSite * This)
{
	return S_OK;
}

HRESULT STDMETHODCALLTYPE InPlSi_GetWindowContext(IOleInPlaceSite * This, IOleInPlaceFrame **ppFrame, IOleInPlaceUIWindow **ppDoc, LPRECT lprcPosRect, LPRECT lprcClipRect, LPOLEINPLACEFRAMEINFO lpFrameInfo)
{
	*ppFrame = browser_ipf;
	*ppDoc = 0;
	GetClientRect(hWnd, lprcPosRect);
	GetClientRect(hWnd, lprcClipRect);

	// The OLEINPLACEFRAMEINFO structure will need to be modified if we ever want custom keystrokes/accelerators
	lpFrameInfo->cb = sizeof(OLEINPLACEFRAMEINFO);
	lpFrameInfo->fMDIApp = FALSE;
	lpFrameInfo->hwndFrame = hWnd;
	lpFrameInfo->haccel = 0;
	lpFrameInfo->cAccelEntries = 0;
	
	return S_OK;
}

HRESULT STDMETHODCALLTYPE InPlSi_Scroll(IOleInPlaceSite * This, SIZE scrollExtant)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlSi_OnUIDeactivate(IOleInPlaceSite * This, BOOL fUndoable)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlSi_OnInPlaceDeactivate(IOleInPlaceSite * This)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlSi_DiscardUndoState(IOleInPlaceSite * This)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlSi_DeactivateAndUndo(IOleInPlaceSite * This)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE InPlSi_OnPosRectChange(IOleInPlaceSite * This, LPCRECT lprcPosRect)
{
	if (browser_ipo_if && browser_ipo_if->lpVtbl)
		browser_ipo_if->lpVtbl->SetObjectRects(browser_ipo_if, lprcPosRect, lprcPosRect);

	return S_OK;
}

//-------------------------------------------------------------------------------------------------

// IOleInPlaceSite vtable
static IOleInPlaceSiteVtbl inplsi_vtable =
{
	InPlSi_QueryInterface,
	InPlSi_AddRef,
	InPlSi_Release,
	InPlSi_GetWindow,
	InPlSi_ContextSensitiveHelp,
	InPlSi_CanInPlaceActivate,	// Determines whether the container can activate the object in place
	InPlSi_OnInPlaceActivate,	// Notifies the container that one of its objects is being activated in place
	InPlSi_OnUIActivate,		// Notifies the container that the object is about to be activated in place and that the object is going to replace the container's main menu with an in-place composite menu
	InPlSi_GetWindowContext,	// Enables an in-place object to retrieve the window interfaces that form the window object hierarchy, and the position in the parent window where the object's in-place activation window should be located
	InPlSi_Scroll,				// Instructs the container to scroll the view of the object by the specified number of pixels
	InPlSi_OnUIDeactivate,		// Notifies the container to reinstall its user interface and take focus
	InPlSi_OnInPlaceDeactivate,	// Notifies the container that it should reinstall its user interface and take focus, and whether the object has an undoable state
	InPlSi_DiscardUndoState,	// Instructs the container to discard its undo state
	InPlSi_DeactivateAndUndo,	// Deactivates the object, ends the in-place session, and reverts to the container's saved undo state
	InPlSi_OnPosRectChange		// Notifies the container that the object extents have changed
};

//-------------------------------------------------------------------------------------------------

HRESULT STDMETHODCALLTYPE DUIH_QueryInterface(IDocHostUIHandler * This, REFIID riid, void **ppvObject)
{
	if (IsEqualIID(riid,&IID_IUnknown) || IsEqualIID(riid,&IID_IDocHostUIHandler)) 
	{
		*ppvObject = browser_dui;
		browser_dui->lpVtbl->AddRef(browser_dui);
		return NOERROR;
	}

	// We're using IOleCommandTarget to intercept javascript error dialogs
	if (IsEqualIID(riid,&IID_IOleCommandTarget))
	{
		*ppvObject = browser_oct;
		browser_oct->lpVtbl->AddRef(browser_oct);
		return NOERROR;
	}

	*ppvObject = 0;
	return E_NOINTERFACE;
}

ULONG STDMETHODCALLTYPE DUIH_AddRef(IDocHostUIHandler * This)
{
	duih_ref_count++;

	return duih_ref_count;
}

ULONG STDMETHODCALLTYPE DUIH_Release(IDocHostUIHandler * This)
{
	duih_ref_count--;

	ASSERT(duih_ref_count >= 0);

	return duih_ref_count;
}

HRESULT STDMETHODCALLTYPE DUIH_ShowContextMenu(IDocHostUIHandler * This, DWORD dwID, POINT *ppt, IUnknown *pcmdtReserved, IDispatch *pdispReserved)
{
	// Pretend we take care of all menus but copy & paste - so the HTML control does not show its own contextual menus
	if (dwID == CONTEXT_MENU_TEXTSELECT)
		return S_FALSE;
	else
		return S_OK;
}

HRESULT STDMETHODCALLTYPE DUIH_GetHostInfo(IDocHostUIHandler * This, DOCHOSTUIINFO *pInfo)
{
	// Specify some of our UI tastes to the HTML control
	pInfo->cbSize = sizeof(DOCHOSTUIINFO);
	pInfo->dwFlags = DOCHOSTUIFLAG_DISABLE_HELP_MENU | DOCHOSTUIFLAG_DISABLE_SCRIPT_INACTIVE | DOCHOSTUIFLAG_NO3DOUTERBORDER | DOCHOSTUIFLAG_SCROLL_NO |
						DOCHOSTUIFLAG_ENABLE_INPLACE_NAVIGATION | DOCHOSTUIFLAG_NOTHEME | DOCHOSTUIFLAG_DPI_AWARE | DOCHOSTUIFLAG_ENABLE_ACTIVEX_INACTIVATE_MODE;
	return S_OK;
}

HRESULT STDMETHODCALLTYPE DUIH_ShowUI(IDocHostUIHandler * This, DWORD dwID, IOleInPlaceActiveObject *pActiveObject, IOleCommandTarget *pCommandTarget, IOleInPlaceFrame *pFrame, IOleInPlaceUIWindow *pDoc)
{
	return S_FALSE; // Use the HTML control's UI rather than our own, for now
}

HRESULT STDMETHODCALLTYPE DUIH_HideUI(IDocHostUIHandler * This)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE DUIH_UpdateUI(IDocHostUIHandler * This)
{
	// We don't have any special UI to update at the host application level
	return S_OK;
}

HRESULT STDMETHODCALLTYPE DUIH_EnableModeless(IDocHostUIHandler * This, BOOL fEnable)
{
	// We don't track the modeless flag state, but as this gets called, reply something meaningful
	return S_OK;
}

HRESULT STDMETHODCALLTYPE DUIH_OnDocWindowActivate(IDocHostUIHandler * This, BOOL fActivate)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE DUIH_OnFrameWindowActivate(IDocHostUIHandler * This, BOOL fActivate)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE DUIH_ResizeBorder(IDocHostUIHandler * This, LPCRECT prcBorder, IOleInPlaceUIWindow *pUIWindow, BOOL fRameWindow)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE DUIH_TranslateAccelerator(IDocHostUIHandler * This, LPMSG lpMsg, const GUID *pguidCmdGroup, DWORD nCmdID)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE DUIH_GetOptionKeyPath(IDocHostUIHandler * This, LPOLESTR *pchKey, DWORD dw)
{
	return S_FALSE;	// Don't use customized settings : use whatever is stored in the default IE registry area
}

HRESULT STDMETHODCALLTYPE DUIH_GetDropTarget(IDocHostUIHandler * This, IDropTarget *pDropTarget, IDropTarget **ppDropTarget)
{
	return E_NOTIMPL;	// We don't supply a customized drop target
}

HRESULT STDMETHODCALLTYPE DUIH_GetExternal(IDocHostUIHandler * This, IDispatch **ppDispatch)
{
	// Plug generic dispatcher that will allow calls from the javascript side
	browser_ext->lpVtbl->AddRef(browser_ext);
	*ppDispatch = browser_ext;
	return S_OK;
}

HRESULT STDMETHODCALLTYPE DUIH_TranslateUrl(IDocHostUIHandler * This, DWORD dwTranslate, OLECHAR *pchURLIn, OLECHAR **ppchURLOut)
{
	return S_FALSE;	// Don't translate 
}

HRESULT STDMETHODCALLTYPE DUIH_FilterDataObject(IDocHostUIHandler * This, IDataObject *pDO, IDataObject **ppDORet)
{
	NOT_IMPLEMENTED
}

//-------------------------------------------------------------------------------------------------

// IDocHostUIHandler vtable
static IDocHostUIHandlerVtbl duih_vtable =
{
	DUIH_QueryInterface,
	DUIH_AddRef,
	DUIH_Release,
	DUIH_ShowContextMenu,
	DUIH_GetHostInfo,
	DUIH_ShowUI,
	DUIH_HideUI,
	DUIH_UpdateUI,
	DUIH_EnableModeless,
	DUIH_OnDocWindowActivate,
	DUIH_OnFrameWindowActivate,
	DUIH_ResizeBorder,
	DUIH_TranslateAccelerator,
	DUIH_GetOptionKeyPath,
	DUIH_GetDropTarget,
	DUIH_GetExternal,
	DUIH_TranslateUrl,
	DUIH_FilterDataObject
};

//-------------------------------------------------------------------------------------------------

HRESULT STDMETHODCALLTYPE OCT_QueryInterface (IOleCommandTarget* This, REFIID riid, void **ppvObject)
{
	if (IsEqualIID(riid,&IID_IUnknown) || IsEqualIID(riid,&IID_IOleCommandTarget))
	{
		*ppvObject = browser_oct;
		browser_oct->lpVtbl->AddRef(browser_oct);
		return NOERROR;
	}

	*ppvObject = 0;
	return E_NOINTERFACE;
}

ULONG STDMETHODCALLTYPE OCT_AddRef (IOleCommandTarget* This)
{
	oct_ref_count++;

	return oct_ref_count;
}

ULONG STDMETHODCALLTYPE OCT_Release (IOleCommandTarget* This)
{
	oct_ref_count--;

	ASSERT(oct_ref_count >= 0);

	return oct_ref_count;
}

HRESULT STDMETHODCALLTYPE OCT_QueryStatus (IOleCommandTarget* This,const GUID* pguidCmdGroup, ULONG cCmds, OLECMD prgCmds[  ], OLECMDTEXT* pCmdText)
{
	return E_NOTIMPL;
}

HRESULT STDMETHODCALLTYPE OCT_Exec (IOleCommandTarget* This, const GUID *pguidCmdGroup, DWORD nCmdID, DWORD nCmdexecopt, VARIANT* pvaIn, VARIANT* pvaOut)
{
	if (pguidCmdGroup && IsEqualGUID(pguidCmdGroup, &CGID_DocHostCommandHandler))
		switch (nCmdID)
		{
			case OLECMDID_SHOWMESSAGE:
				 return OLECMDERR_E_NOTSUPPORTED;

			case OLECMDID_SHOWSCRIPTERROR:
				// The JavaScript engine reported an error: stop running scripts on the page
				pvaOut->vt = VT_BOOL;
				pvaOut->boolVal = VARIANT_FALSE;
				return S_OK;

			default:
				 return OLECMDERR_E_NOTSUPPORTED;
         }

	 return OLECMDERR_E_UNKNOWNGROUP;
}

// IOleCommandTarget vtable
static IOleCommandTargetVtbl oct_vtable =
{
	OCT_QueryInterface,
	OCT_AddRef,
	OCT_Release,
	OCT_QueryStatus,
	OCT_Exec
};

//-------------------------------------------------------------------------------------------------

HRESULT STDMETHODCALLTYPE ClSi_QueryInterface(IOleClientSite * This, REFIID riid, void **ppvObject)
{
	if (IsEqualIID(riid,&IID_IUnknown) || IsEqualIID(riid,&IID_IOleClientSite)) 
	{
		*ppvObject = browser_cs;
		browser_cs->lpVtbl->AddRef(browser_cs);
		return NOERROR;
	}

	if (IsEqualIID(riid,&IID_IOleInPlaceSite))
	{
		*ppvObject = browser_ips;
		browser_ips->lpVtbl->AddRef(browser_ips);
		return NOERROR;
	}

	if (IsEqualIID(riid,&IID_IServiceProvider)) 
	{
		*ppvObject = 0;
		return E_NOINTERFACE;
	}

	if (IsEqualIID(riid,&IID_IDispatch)) 
	{
		*ppvObject = 0;
		return E_NOINTERFACE;
	}

	if (IsEqualIID(riid,&IID_IDocHostUIHandler))
	{
		*ppvObject = browser_dui;
		browser_dui->lpVtbl->AddRef(browser_dui);
		return NOERROR;
	}

	*ppvObject = 0;
	return E_NOINTERFACE;
}

ULONG STDMETHODCALLTYPE ClSi_AddRef(IOleClientSite * This)
{
	clsi_ref_count++;
	if (clsi_ref_count == 1)
	{
		// Initialize sub-objects
	}

	return clsi_ref_count;
}

ULONG STDMETHODCALLTYPE ClSi_Release(IOleClientSite * This)
{
	clsi_ref_count--;

	ASSERT(clsi_ref_count >= 0);

	// Dispose of our sub-objects here
	return clsi_ref_count;
}

HRESULT STDMETHODCALLTYPE ClSi_SaveObject(IOleClientSite * This)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE ClSi_GetMoniker(IOleClientSite * This, DWORD dwAssign, DWORD dwWhichMoniker, IMoniker **ppmk)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE ClSi_GetContainer(IOleClientSite * This, IOleContainer **ppContainer)
{
	// We don't support IOleContainer interface at that time
	*ppContainer = 0;
	return E_NOINTERFACE;
}

HRESULT STDMETHODCALLTYPE ClSi_ShowObject(IOleClientSite * This)
{
	return S_OK;
}

HRESULT STDMETHODCALLTYPE ClSi_OnShowWindow(IOleClientSite * This, BOOL fShow)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE ClSi_RequestNewObjectLayout(IOleClientSite * This)
{
	NOT_IMPLEMENTED
}

//-------------------------------------------------------------------------------------------------

// IOleClientSite vtable
static IOleClientSiteVtbl clsi_vtable = 
{
	ClSi_QueryInterface,
	ClSi_AddRef,
	ClSi_Release,
	ClSi_SaveObject,			// Saves the embedded object associated with the client site
	ClSi_GetMoniker,			// Retrieves a moniker for the object's client site
	ClSi_GetContainer,			// Retrieves a pointer to the object's container
	ClSi_ShowObject,			// Asks a container to display its object to the user
	ClSi_OnShowWindow,			// Notifies a container when an embedded object's window is about to become visible or invisible
	ClSi_RequestNewObjectLayout	// Asks a container to resize the display site for embedded objects
};

//-------------------------------------------------------------------------------------------------

void invoke_js_routine (wchar_t* wcs)
{
	BSTR wcs_as_bstr;

	wcs_as_bstr = SysAllocString(wcs);
	PostMessage(hWnd, WM_EXEC_JS_SCRIPT, 0, (LPARAM) wcs_as_bstr);
}

//-------------------------------------------------------------------------------------------------

BOOL CALLBACK enum_proc(HWND window, LPARAM reply)
{
	static wchar_t wanted[] = L"Internet Explorer_Server";
	char buf[sizeof(wanted)];

	if (GetClassName(window, (wchar_t*) buf, sizeof(wanted)/sizeof(wanted[0]))
		&& !memcmp(buf, wanted, sizeof(wanted)))
	{
		// Report success and stop enumeration
		(*(HWND*) reply) = window;
		return FALSE;
	}
	else
		return TRUE;
}

void set_native_ready (void)
{
	// Find browser window and subclass its window proc so we can intercept back key presses...
	HWND hBrowserWnd = 0;
	WNDPROC browser_wnd_proc;

	EnumChildWindows(hWnd, enum_proc, (LPARAM) &hBrowserWnd);

	browser_wnd_proc = (WNDPROC) GetWindowLong(hBrowserWnd, GWL_WNDPROC);
	if (browser_wnd_proc && browser_wnd_proc != BrowserWndProcWrapper)
	{
		initial_browser_wnd_proc = browser_wnd_proc;
		SetWindowLong(hBrowserWnd, GWL_WNDPROC, (LONG) BrowserWndProcWrapper);
		BringWindowToTop(hBrowserWnd);
	}

	// Fire onNativeReady event
	invoke_js_routine(L"cordova.require('cordova/channel').onNativeReady.fire();");
}

//-------------------------------------------------------------------------------------------------

HRESULT STDMETHODCALLTYPE Ext_QueryInterface(IDispatch * This, REFIID riid, void **ppvObject)
{
	if (IsEqualIID(riid,&IID_IUnknown) || IsEqualIID(riid,&IID_IDispatch)) 
	{
		*ppvObject = browser_ext;
		browser_ext->lpVtbl->AddRef(browser_ext);
		return NOERROR;
	}

	*ppvObject = 0;
	return E_NOINTERFACE;
}

ULONG STDMETHODCALLTYPE Ext_AddRef(IDispatch * This)
{
	ext_ref_count++;

	return ext_ref_count;
}

ULONG STDMETHODCALLTYPE Ext_Release(IDispatch * This)
{
	ext_ref_count--;

	ASSERT(ext_ref_count >= 0);

	return ext_ref_count;
}

HRESULT STDMETHODCALLTYPE Ext_GetTypeInfoCount(IDispatch * This, UINT *pctinfo)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE Ext_GetTypeInfo(IDispatch * This, UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE Ext_GetIDsOfNames(IDispatch * This, REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId)
{
	HRESULT hr = S_OK;
	UINT	i;

	// Map method name to integer
	for ( i=0; i < cNames; i++)
		if (CompareString( lcid, NORM_IGNORECASE, gate_name, -1, rgszNames[i], -1 ) == CSTR_EQUAL)
			rgDispId[i] = DISPID_GATE;
		else
		{
			// At least one unknown selector
			rgDispId[i] = DISPID_UNKNOWN;
			hr = DISP_E_UNKNOWNNAME;
		}

	return hr;
}

HRESULT STDMETHODCALLTYPE Ext_Invoke(IDispatch * This, DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr)
{
	if (dispIdMember == DISPID_GATE)
	{
		if (wFlags & DISPATCH_METHOD)
		{
			CordovaModule *module;

			// Check params
			if (pDispParams->cArgs != 4)
				return DISP_E_BADPARAMCOUNT;

			if (pDispParams->rgvarg[0].vt != VT_BSTR || 
				pDispParams->rgvarg[1].vt != VT_BSTR || 
				pDispParams->rgvarg[2].vt != VT_BSTR || 
				pDispParams->rgvarg[3].vt != VT_BSTR)
					return DISP_E_TYPEMISMATCH;

			// Find module
			module = find_cordova_module(pDispParams->rgvarg[2].bstrVal);
			if (module == NULL)
				return DISP_E_MEMBERNOTFOUND;

			// Execute command
			return module->exec(pDispParams->rgvarg[3].bstrVal, pDispParams->rgvarg[1].bstrVal, pDispParams->rgvarg[0].bstrVal, pVarResult);
		}
	}

	return DISP_E_MEMBERNOTFOUND;
}

//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------

HRESULT STDMETHODCALLTYPE Disp_QueryInterface(IDispatch * This, REFIID riid, void **ppvObject)
{
	if (IsEqualIID(riid,&IID_IUnknown) || IsEqualIID(riid,&IID_IDispatch)) 
	{
		*ppvObject = browser_dsp;
		browser_dsp->lpVtbl->AddRef(browser_dsp);
		return NOERROR;
	}

	// We also get called for DIID_DWebBrowserEvents2, but IDispatch is fine

	*ppvObject = 0;
	return E_NOINTERFACE;
}

ULONG STDMETHODCALLTYPE Disp_AddRef(IDispatch * This)
{
	disp_ref_count++;

	return disp_ref_count;
}

ULONG STDMETHODCALLTYPE Disp_Release(IDispatch * This)
{
	disp_ref_count--;

	ASSERT(disp_ref_count >= 0);

	return disp_ref_count;
}

HRESULT STDMETHODCALLTYPE Disp_GetTypeInfoCount(IDispatch * This, UINT *pctinfo)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE Disp_GetTypeInfo(IDispatch * This, UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE Disp_GetIDsOfNames(IDispatch * This, REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId)
{
	NOT_IMPLEMENTED
}

HRESULT STDMETHODCALLTYPE Disp_Invoke(IDispatch * This, DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr)
{
	HRESULT hr;
	wchar_t* title;

	// That's our DIID_DWebBrowserEvents2 event sink callback

	switch (dispIdMember)
	{
		case DISPID_DOCUMENTCOMPLETE:
			// Get access to the document IDispatch interface
			// Note: in the presence of frames, we would receive several of these events and would need
			// to check that the IUnknown interfaces for This and browser_web_if are identical
			// We may get a nil pointer if the base document fails to load
			hr = browser_web_if->lpVtbl->get_Document(browser_web_if, &document_dispatch_if);

			if (document_dispatch_if)
			{
				// Retrieve IHTMLDocument2 interface
				hr = document_dispatch_if->lpVtbl->QueryInterface(document_dispatch_if, &IID_IHTMLDocument2, &document_html2_if);

				// Retrieve IHTMLWindow2 interface
				document_html2_if->lpVtbl->get_parentWindow(document_html2_if, &html_window2_if);

				// Set initial Cordova state and release application
				set_native_ready();
				current_state = STATE_NATIVE_READY;
			}
			break;

		case DISPID_TITLECHANGE:
			if (skip_title_update)
			{
				skip_title_update--;
				break;
			}

			// Update window caption
			title = pDispParams->rgvarg[0].bstrVal;
			SetWindowText(hWnd, title);
			break;

		case DISPID_NAVIGATEERROR:
			{
				// Silently dismiss navigation errors for now
				VARIANT_BOOL * cancel = pDispParams->rgvarg[0].pboolVal;
				*cancel = VARIANT_TRUE;
			}
			return S_OK;

		default:
			;
	}

	return S_OK;
}

//-------------------------------------------------------------------------------------------------

static IDispatchVtbl disp_vtable = 
{
	Disp_QueryInterface,
	Disp_AddRef,
	Disp_Release,
	Disp_GetTypeInfoCount,
	Disp_GetTypeInfo,
	Disp_GetIDsOfNames,
	Disp_Invoke
};

//-------------------------------------------------------------------------------------------------

static IDispatchVtbl ext_vtable = 
{
	Ext_QueryInterface,
	Ext_AddRef,
	Ext_Release,
	Ext_GetTypeInfoCount,
	Ext_GetTypeInfo,
	Ext_GetIDsOfNames,
	Ext_Invoke
};

//-------------------------------------------------------------------------------------------------

#define MAIN_WINDOW_CLASS	L"Cordova Shell Window"
#define MAIN_WINDOW_NAME	APP_NAME
#define MAIN_WINDOW_STYLE	WS_OVERLAPPEDWINDOW

//-------------------------------------------------------------------------------------------------

static void call_js_script(BSTR wcs_as_bstr)
{
	VARIANT v;

	if (html_window2_if)
	{
		VariantInit(&v);
		html_window2_if->lpVtbl->execScript(html_window2_if, wcs_as_bstr, javascript, &v);
		SysFreeString(wcs_as_bstr);
	}
}


void ProcessBackKeyStroke (void)
{
	// I there are listeners for back button down notifications
	if (is_back_button_event_enabled())
	{
		call_js_script(SysAllocString(L"cordova.fireDocumentEvent('backbutton');"));
	}
}

LRESULT CALLBACK CordovaShellWndProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	// WindowProc for the main host application window

	switch (uMsg)
	{
		case WM_KEYDOWN:
			if (wParam == VK_BACK)
				ProcessBackKeyStroke();
			break;

		case WM_CLOSE:
			current_state = STATE_ENDING;	// The window will get deactivated before being destroyed
											// Do not bother sending "pause" event
											// But send the "destroy" event
			call_js_script(SysAllocString(L"cordova.require('cordova/channel').onDestroy.fire();"));
			break;
	
		case WM_DESTROY: 
			PostQuitMessage(0); 
			return 0; 

		case WM_SIZE: 
			if (browser_web_if && browser_web_if->lpVtbl)
			{
				browser_web_if->lpVtbl->put_Width(browser_web_if, LOWORD(lParam));
				browser_web_if->lpVtbl->put_Height(browser_web_if, HIWORD(lParam));
			}

			if (hCaptureWnd)
				SetWindowPos(hCaptureWnd, 0, 0, 0, LOWORD(lParam), HIWORD(lParam), SWP_NOMOVE | SWP_NOZORDER);
			return 0;

		case WM_DISPLAYCHANGE:
			camera_notify_display_change();
			return 0;

		case WM_EXEC_JS_SCRIPT:
			call_js_script((BSTR) lParam);
			return 0;

		case WM_USER_ACCEL:
			// New accelerometer sample available ; propagate to the JS side
			propagate_accel_sample();
			return 0;

		case WM_USER_COMPASS:
			// New compass sample available ; propagate to the JS side
			propagate_compass_sample();
			return 0;

		case WM_PARENTNOTIFY:
			// The capture window got destroyed, time to let the JS side know the outcome of the last requested service
			if (LOWORD(wParam) == WM_DESTROY && (HWND) lParam == hCaptureWnd)
			{
				notify_capture_result();
			}
			break;

		case WM_ACTIVATE:
			if (LOWORD(wParam))
			{
				// Window activated ; send resume event if in paused state
				if (current_state == STATE_PAUSED)
				{
					invoke_js_routine(L"cordova.require('cordova/channel').onResume.fire();");
					current_state = STATE_NATIVE_READY;
				}
			}
			else
			{
				// Window deactivated ; send pause event if we're in active state
				if (current_state == STATE_NATIVE_READY)
				{
					invoke_js_routine(L"cordova.require('cordova/channel').onPause.fire();");
					current_state = STATE_PAUSED;
				}
			}
			break;

		default:
			return DefWindowProc(hWnd, uMsg, wParam, lParam);
	}

	return DefWindowProc(hWnd, uMsg, wParam, lParam);
}

//-------------------------------------------------------------------------------------------------

LRESULT CALLBACK BrowserWndProcWrapper(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	if (uMsg == WM_KEYDOWN && wParam == VK_BACK)
		ProcessBackKeyStroke();

	return initial_browser_wnd_proc(hWnd, uMsg, wParam, lParam);
}

//-------------------------------------------------------------------------------------------------

void create_browser_object (void)
{
	HRESULT hr;
	BSTR base_url;
	VARIANT nil;
	BSTR app_name;
	IConnectionPointContainer* cp_container_if;
	IConnectionPoint* cp_if;

	// Initialize client site object
	browser_cs = &clsi;
	browser_cs->lpVtbl = &clsi_vtable;

	// Initialize in place site object
	browser_ips = &inplsi;
	browser_ips->lpVtbl = &inplsi_vtable;

	// Initialize in place frame object
	browser_ipf = &inplfr;
	browser_ipf->lpVtbl = &inplfr_vtable;

	// Initialize event dispatcher object
	browser_dsp = &disp;
	browser_dsp->lpVtbl = &disp_vtable;

	// Initialize external interface dispatcher object
	browser_ext = &ext;
	browser_ext->lpVtbl = &ext_vtable;

	// Initialize host doc ui handler object
	browser_dui = &duih;
	browser_dui->lpVtbl = &duih_vtable;
	
	// Initialize OLE command target object
	browser_oct = &oct;
	browser_oct->lpVtbl = &oct_vtable;

	CoCreateInstance(&CLSID_WebBrowser, NULL, CLSCTX_INPROC_SERVER,  &IID_IWebBrowser2, (void**)&browser_web_if);

	if (browser_web_if)
	{
		// Get IOleObject interface
		browser_web_if->lpVtbl->QueryInterface(browser_web_if, &IID_IOleObject, &browser_ole_if);

		if (browser_ole_if)
		{
			app_name = SysAllocString(APP_NAME);

			hr = browser_ole_if->lpVtbl->SetClientSite(browser_ole_if, browser_cs);
			hr = browser_ole_if->lpVtbl->SetHostNames(browser_ole_if, app_name, 0);

			// Activate object
			hr = browser_ole_if->lpVtbl->DoVerb(browser_ole_if, OLEIVERB_INPLACEACTIVATE, 0, browser_cs, 0, hWnd, 0);
		}

		// Also get a IOleInPlaceObject interface, as it's the expected way to resize the browser control
		browser_web_if->lpVtbl->QueryInterface(browser_web_if, &IID_IOleInPlaceObject, &browser_ipo_if);

		// Connect an event sink to the browser so we can get notified when there's an update to the document title

		hr = browser_web_if->lpVtbl->QueryInterface(browser_web_if, &IID_IConnectionPointContainer, &cp_container_if);
		hr = cp_container_if->lpVtbl->FindConnectionPoint(cp_container_if, &DIID_DWebBrowserEvents2, &cp_if);
		hr = cp_if->lpVtbl->Advise(cp_if, (IUnknown*) browser_dsp, &browser_dsp_cookie);

		// Disable drag & drop on our window
		hr = browser_web_if->lpVtbl->put_RegisterAsDropTarget(browser_web_if, VARIANT_FALSE);

		// Direct the browser to our index.html file

		base_url = SysAllocString(full_path);
		VariantInit(&nil);

		hr = browser_web_if->lpVtbl->Navigate(browser_web_if, base_url, &nil, &nil, &nil, &nil);
	
		if (hr == S_OK)
			// Display our HTML window
			hr = browser_web_if->lpVtbl->put_Visible(browser_web_if, VARIANT_TRUE);
		else
			browser_web_if->lpVtbl->Quit(browser_web_if);

		SysFreeString(base_url);

		browser_web_if->lpVtbl->Release(browser_web_if);
	}
}

//-------------------------------------------------------------------------------------------------

void set_ie_feature (wchar_t* key_name, DWORD new_val)
{
	wchar_t filename[_MAX_PATH];
	wchar_t* last_component;
	DWORD info;
	HKEY key;
	LONG ret;
	DWORD len;
	DWORD val;
	DWORD type;

	filename[0]  = L'\0';

	// First retrieve the current executable name
	GetModuleFileName(0, filename, _MAX_PATH);

	last_component = wcsrchr(filename, L'\\');

	if (last_component && *last_component == '\\')
		last_component++;
	else
		return;


	ret = RegCreateKeyEx(HKEY_CURRENT_USER, key_name, 0, 0, 0, KEY_READ | KEY_WRITE, 0, &key, &info);

	if (ret != ERROR_SUCCESS)
		return;

	len = sizeof(DWORD);

	ret = RegQueryValueEx(key, last_component, 0, &type, (LPBYTE) &val, &len);

	// If no value exists for our exe name (e.g. it hasn't been explicitly enabled or disabled)
	if (ret != ERROR_SUCCESS || type != REG_DWORD)
		// Stick a value there named after our exe name
		RegSetValueEx(key, last_component, 0, REG_DWORD, (LPBYTE) &new_val, sizeof(DWORD));

	RegCloseKey(key);
}

//-------------------------------------------------------------------------------------------------

int get_ie_version (void)
{
	DWORD info;
	HKEY key;
	LONG ret;
	DWORD len;
	DWORD type;
	wchar_t buf[20];
	int major;

	buf[0] = L'\0';

	ret = RegCreateKeyEx(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Microsoft\\Internet Explorer" , 0, 0, 0, KEY_READ, 0, &key, &info);

	if (ret != ERROR_SUCCESS)
		return -1;

	if (info == REG_OPENED_EXISTING_KEY)
	{
		len = sizeof(buf);

		ret = RegQueryValueEx(key, L"Version", 0, &type, (LPBYTE) buf, &len);

		if (ret == ERROR_SUCCESS)
		{
			major = _wtoi(buf);
			RegCloseKey(key);
			return major;
		}
	}

	RegCloseKey(key);
	return -1;
}

//-------------------------------------------------------------------------------------------------

void early_init (void)
{
	DWORD major, minor;
	INITCOMMONCONTROLSEX ccex;
	DWORD winver = GetVersion();

	major = (DWORD)(LOBYTE(LOWORD(winver)));
	minor = (DWORD)(HIBYTE(LOWORD(winver)));

	// We need at least Windows Seven
	if (major < 6 || (major == 6 && minor < 1))
	{
		MessageBox(GetForegroundWindow(), L"This program requires Windows 7 or newer.", L"Missing Prerequisites", MB_OK);
		ExitProcess(61);
	}

	// IE 9 or newer required
	if (get_ie_version() < 9)
	{
		MessageBox(GetForegroundWindow(), L"This program requires Internet Explorer 9 or newer", L"Missing Prerequisites", MB_OK);
		ExitProcess(90);
	}

	// Form full path for our base URL file ; better do this early, as the current directory can be changed later
	GetFullPathName(BASE_URL, _MAX_PATH, full_path, 0);	// Possible failure if the base directory has a very long name


	// A little BSTR object that we'll need to invoke js routines
	javascript = SysAllocString(L"javascript");

	// IE GPU acceleration is disabled by default for apps hosting the HTML control
	set_ie_feature(IE_GPU_REG_KEY, 1);

	// Disable pre-IE9 emulation
	set_ie_feature(IE_COMPAT_REG_KEY, 9999);

	// We need both COM (sensor API, etc) and OLE (WebBrowser control) services
	if (!SUCCEEDED(OleInitialize(0)))
		ExitProcess(0x01e);

	// Ensure the common controls library is setup to allow toolbar creation
	ccex.dwSize = sizeof(INITCOMMONCONTROLSEX);
	ccex.dwICC  = ICC_BAR_CLASSES;
	InitCommonControlsEx(&ccex);
}

//-------------------------------------------------------------------------------------------------

int CALLBACK WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
	MSG msg;
	int code;
	WNDCLASSEX wc = {
		sizeof(WNDCLASSEX),
		CS_HREDRAW | CS_VREDRAW,
		CordovaShellWndProc,
		0,
		0,
		0,
		0,	// >>> icon 
		LoadCursor(NULL, IDC_ARROW),
		0, // must handle background paint
		0,
		MAIN_WINDOW_CLASS,
		0 // >>> small icon update
		};

	set_thread_name(-1, "Primary Thread");

	early_init();
	register_cordova_modules();

	RegisterClassEx(&wc);

	hWnd = CreateWindow(MAIN_WINDOW_CLASS, MAIN_WINDOW_NAME, MAIN_WINDOW_STYLE, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, 0, 0, 0, 0);

	if (!hWnd)
		return 0;

	create_browser_object();

	ShowWindow(hWnd, nCmdShow); 
	UpdateWindow(hWnd);

	setup_capture();

	while ((code = GetMessage( &msg, 0, 0, 0 )) != 0)
	{
		if (code == -1)
		{
		}
		else
		{
			TranslateMessage(&msg);
			DispatchMessage(&msg);
		}
	} 

	close_cordova_modules();
	OleUninitialize();

	return msg.wParam;
}


// http://msdn.microsoft.com/en-us/ie/aa740471 for IE9 headers & libs
// $(ProgramFiles)\Microsoft SDKs\Internet Explorer\v9\include
// http://msdn.microsoft.com/en-us/library/ie/bb508516%28v=vs.85%29.aspx for MSHTML usage notes
// http://support.microsoft.com/kb/261003/en-us for error handling

