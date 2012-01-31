/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

if (!PhoneGap.hasResource("battery")) {

PhoneGap.addResource("battery");

PhoneGap.onPhoneGapInit.subscribeOnce(function() {

	navigator.battery = navigator.battery || 
	{


		_events:{},
		_isAttached:false,

		_onBatteryStatusChanged:function(eventName,result)
		{

		},

		addEventListener: function(eventName, funk)
		{
			this._events[eventName] = this._events[eventName] || [];
			this._events[eventName].push(funk);
			if(!this._isAttached)
			{
				// exec start
			}
		},

		removeEventListener: function(eventName, funk)
		{
			if( eventName in this._events === false  )	
				return;

			this._events[eventName].splice(this._events[eventName].indexOf(funk), 1);
			if(this._isAttached)
			{
				var hasListeners = false;
				for(var v in this._events)
				{
					if(this._events[v].length)
					{
						hasListeners = true;
						break;
					}
				}
				if(!hasListeners)
				{
					// exec stop
				}
			}
		},

		dispatchEvent: function(eventName /* , args... */)
		{
			if( eventName in this._events === false  )	
				return;
			for(var i = 0; i < this._events[event].length; i++)
			{
				this._events[eventName][i].apply(this, Array.prototype.slice.call(arguments, 1))
			}
		}

	};

});

}