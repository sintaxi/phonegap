
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

/**
 * The BlackBerryContacts class contains functionality that is specific to 
 * BlackBerry Widget Contacts. 
 */
var BlackBerryContacts = function() {

    // Mappings for each Contact field that may be used in a find operation. 
    // Contains all Contact fields that map to one or more fields in a BlackBerry 
    // contact object.
    // 
    // Example: user searches with a filter on the Contact 'name' field:
    //
    // <code>Contacts.find(['name'], onSuccess, onFail, {filter:'Bob'});</code>
    // 
    // The 'name' field does not exist in a BlackBerry contact.  Instead, a
    // filter expression will be built to search the BlackBerry contacts using
    // the BlackBerry 'firstName' and 'lastName' fields.   
    //
    this.fieldMappings = {
         "id"                        : "uid",
         "displayName"               : "title",
         "name"                      : [ "firstName", "lastName" ],
         "name.formatted"            : [ "firstName", "lastName" ],
         "name.givenName"            : "firstName",
         "name.familyName"           : "lastName",
         "phoneNumbers"              : [ "faxPhone", "homePhone", "homePhone2", 
                                         "mobilePhone", "pagerPhone", "otherPhone",
                                         "workPhone", "workPhone2" ],
         "phoneNumbers.value"        : [ "faxPhone", "homePhone", "homePhone2", 
                                         "mobilePhone", "pagerPhone", "otherPhone",
                                         "workPhone", "workPhone2" ],
         "emails"                    : [ "email1", "email2", "email3" ],
         "addresses"                 : [ "homeAddress.address1", "homeAddress.address2",
                                         "homeAddress.city", "homeAddress.stateProvince",
                                         "homeAddress.zipPostal", "homeAddress.country",
                                         "workAddress.address1", "workAddress.address2",
                                         "workAddress.city", "workAddress.stateProvince",
                                         "workAddress.zipPostal", "workAddress.country" ],
         "addresses.formatted"       : [ "homeAddress.address1", "homeAddress.address2",
                                         "homeAddress.city", "homeAddress.stateProvince",
                                         "homeAddress.zipPostal", "homeAddress.country",
                                         "workAddress.address1", "workAddress.address2",
                                         "workAddress.city", "workAddress.stateProvince",
                                         "workAddress.zipPostal", "workAddress.country" ],
         "addresses.streetAddress"   : [ "homeAddress.address1", "homeAddress.address2",
                                         "workAddress.address1", "workAddress.address2" ],
         "addresses.locality"        : [ "homeAddress.city", "workAddress.city" ],
         "addresses.region"          : [ "homeAddress.stateProvince", "workAddress.stateProvince" ],
         "addresses.country"         : [ "homeAddress.country", "workAddress.country" ],
         "organizations"             : [ "company", "jobTitle" ],
         "organizations.name"        : "company",
         "organizations.title"       : "jobTitle",
         "birthday"                  : "birthday",
         "anniversary"               : "anniversary",
         "note"                      : "note",
         "urls"                      : "webpage",
         "urls.value"                : "webpage"
  }
};

/**
 * Retrieves a BlackBerry contact from the device by unique id.
 * @param uid Unique id of the contact on the device
 * @return {blackberry.pim.Contact} BlackBerry contact or null if contact with specified id is not found
 */
BlackBerryContacts.findByUniqueId = function(uid) {
    if (!uid) {
        return null;
    }
    var bbContacts = blackberry.pim.Contact.find(
            new blackberry.find.FilterExpression("uid", "==", uid));
    return bbContacts[0] || null;
};

/**
 * Creates a BlackBerry contact object from the specified Contact object 
 * and persists it to device storage.
 * @param {Contact} contact The contact to save
 * @return id of the saved contact
 */
BlackBerryContacts.saveToDevice = function(contact) {

    if (!contact) {
        return;
    }
    
    var bbContact = null;
    var update = false;

    // if the underlying BlackBerry contact already exists, retrieve it for update
    if (contact.id) {
        // we must attempt to retrieve the BlackBerry contact from the device 
        // because this may be an update operation
        bbContact = BlackBerryContacts.findByUniqueId(contact.id);
    }
    
    // contact not found on device, create a new one
    if (!bbContact) {
        bbContact = new blackberry.pim.Contact();
    }
    // update the existing contact
    else {
        update = true;
    }
    
    // NOTE: The user may be working with a partial Contact object, because only
    // user-specified Contact fields are returned from a find operation (blame 
    // the W3C spec).  If this is an update to an existing Contact, we don't 
    // want to clear an attribute from the contact database simply because the 
    // Contact object that the user passed in contains a null value for that
    // attribute.  So we only copy the non-null Contact attributes to the 
    // BlackBerry contact object before saving.
    //
    // This means that a user must explicitly set a Contact attribute to a 
    // non-null value in order to update it in the contact database.
    //
    // name
    if (contact.name !== null) {   
        if (contact.name.givenName !== null) {
            bbContact.firstName = contact.name.givenName;
        }
        if (contact.name.familyName !== null) {
            bbContact.lastName = contact.name.familyName;
        }
    }
    
    // display name
    if (contact.displayName !== null) {
        bbContact.title = contact.displayName;
    }
    
    // note
    if (contact.note !== null) {
        bbContact.note = contact.note;
    }

    // birthday and anniversary
    //
    // user may pass in Date object or a string representation of a date 
    // (the W3C Contacts API calls for birthday and anniversary to be DOMStrings)
    // if it is a string, we don't know the date format, so try to create a
    // new Date with what we're given
    // 
    // NOTE: BlackBerry's Date.parse() does not work well, so use new Date()
    //
    if (contact.birthday !== null) {
        if (contact.birthday instanceof Date) {
            bbContact.birthday = contact.birthday;
        } else {
            var bday = contact.birthday.toString();
            bbContact.birthday = (bday.length > 0) ? new Date(bday) : "";
        }
    }
    if (contact.anniversary !== null) {
        if (contact.anniversary instanceof Date) {
            bbContact.anniversary = contact.anniversary;
        } else {
            var anniversary = contact.anniversary.toString();
            bbContact.anniversary = (anniversary.length > 0) ? new Date(anniversary) : "";
        }
    }

    // BlackBerry supports three email addresses
    if (contact.emails && contact.emails instanceof Array) {
        
        // if this is an update, re-initialize email addresses
        if (update) {
            bbContact.email1 = "";
            bbContact.email2 = "";
            bbContact.email3 = "";
        }
        
        // copy the first three email addresses found
        var email = null;
        for (var i in contact.emails) {
            email = contact.emails[i];
            if (!email || !email.value) { 
                continue; 
            }
            if (bbContact.email1 === "") {
                bbContact.email1 = email.value;
            }
            else if (bbContact.email2 === "") {
                bbContact.email2 = email.value;
            }
            else if (bbContact.email3 === "") {
                bbContact.email3 = email.value;
            }
        }
    }

    // BlackBerry supports a finite number of phone numbers
    // copy into appropriate fields based on type
    if (contact.phoneNumbers && contact.phoneNumbers instanceof Array) {

        // if this is an update, re-initialize phone numbers
        if (update) {
            bbContact.homePhone = "";
            bbContact.homePhone2 = "";
            bbContact.workPhone = "";
            bbContact.workPhone2 = "";
            bbContact.mobilePhone = "";
            bbContact.faxPhone = "";
            bbContact.pagerPhone = "";
            bbContact.otherPhone = "";
        }        
        
        var type = null;
        var number = null;
        for (i in contact.phoneNumbers) {
            if (!contact.phoneNumbers[i] || !contact.phoneNumbers[i].value) { 
                continue; 
            }
            type = contact.phoneNumbers[i].type;
            number = contact.phoneNumbers[i].value;
            if (type === 'home') {
                if (bbContact.homePhone === "") { 
                    bbContact.homePhone = number; 
                }
                else if (bbContact.homePhone2 === "") { 
                    bbContact.homePhone2 = number; 
                }
            } else if (type === 'work') {
                if (bbContact.workPhone === "") { 
                    bbContact.workPhone = number; 
                }
                else if (bbContact.workPhone2 === "") { 
                    bbContact.workPhone2 = number; 
                }
            } else if (type === 'mobile' && bbContact.mobilePhone === "") {
                bbContact.mobilePhone = number;
            } else if (type === 'fax' && bbContact.faxPhone === "") {
                bbContact.faxPhone = number;
            } else if (type === 'pager' && bbContact.pagerPhone === "") {
                bbContact.pagerPhone = number;
            } else if (bbContact.otherPhone === "") {
                bbContact.otherPhone = number;
            }
        }
    }
    
    // BlackBerry supports two addresses: home and work
    // copy the first two addresses found from Contact
    if (contact.addresses && contact.addresses instanceof Array) {
        
        // if this is an update, re-initialize addresses
        if (update) {
            bbContact.homeAddress = null;
            bbContact.workAddress = null;
        }
        
        var address = null;
        var bbHomeAddress = null;
        var bbWorkAddress = null;
        for (i in contact.addresses) {
            address = contact.addresses[i];
            if (!address || address instanceof ContactAddress === false) {
                continue; 
            }
            
            if (bbHomeAddress === null) {
                bbHomeAddress = address.toBlackBerryAddress();
                bbContact.homeAddress = bbHomeAddress;
            }
            else if (bbWorkAddress === null) {
                bbWorkAddress = address.toBlackBerryAddress();
                bbContact.workAddress = bbWorkAddress;
            }
        }
    }

    // copy first url found to BlackBerry 'webpage' field
    if (contact.urls && contact.urls instanceof Array) {
        
        // if this is an update, re-initialize web page
        if (update) {
            bbContact.webpage = "";
        }
        
        var url = null;
        for (i in contact.urls) {
            url = contact.urls[i];
            if (!url || !url.value) { 
                continue; 
            }
            if (bbContact.webpage === "") {
                bbContact.webpage = url.value;
                break;
            }
        }
    }
   
    // copy fields from first organization to the 
    // BlackBerry 'company' and 'jobTitle' fields
    if (contact.organizations && contact.organizations instanceof Array) {
        
        // if this is an update, re-initialize org attributes
        if (update) {
            bbContact.company = "";
        }
        
        var org = null;
        for (i in contact.organizations) {
            org = contact.organizations[i];
            if (!org) { 
                continue; 
            }
            if (bbContact.company === "") {
                bbContact.company = org.name || "";
                bbContact.jobTitle = org.title || "";
                break;
            }
        }
    }

    // save to device
    bbContact.save();
    
    return bbContact.uid;
};

/**
 * Builds a BlackBerry filter expression using the contact fields and search 
 * filter provided.  The filter expression is used for contact searches.
 * @param {String[]} fields Array of Contact fields to search
 * @param {String} filter Filter, or search string
 * @return filter expression or null if fields is empty or filter is null or empty
 */
BlackBerryContacts.buildFilterExpression = function(fields, filter) {
    
    // ensure filter exists
    if (!filter || filter === "") {
        return null;
    }

    // BlackBerry API uses specific operators to build filter expressions for 
    // querying Contact lists.  The operators are ["!=","==","<",">","<=",">="].
    // Use of regex is also an option, and the only one we can use to simulate
    // an SQL '%LIKE%' clause.  
    //
    // Note: The BlackBerry regex implementation doesn't seem to support 
    // conventional regex switches that would enable a case insensitive search.  
    // It does not honor the (?i) switch (which causes Contact.find() to fail). 
    // We need case INsensitivity to match the W3C Contacts API spec.  
    // So the guys at RIM proposed this method: 
    //
    // original filter = "norm"
    // case insensitive filter = "[nN][oO][rR][mM]"
    //
    var ciFilter = "";
    for (var i = 0; i < filter.length; i++)
    {
      ciFilter = ciFilter + "[" + filter[i].toLowerCase() + filter[i].toUpperCase() + "]";
    }
    
    // match anything that contains our filter string
    filter = ".*" + ciFilter + ".*";
    
    // build a filter expression using all Contact fields provided
    var filterExpression = null;
    if (fields && fields instanceof Array) {
        var fe = null;
        for (var i in fields) {
            if (!fields[i]) {
                continue;
            }

            // retrieve the BlackBerry contact fields that map to the one specified
            var bbFields = navigator.service.BlackBerryContacts.fieldMappings[fields[i]];
            
            // BlackBerry doesn't support the field specified
            if (!bbFields) {
                continue;
            }

            // construct the filter expression using the BlackBerry fields
            for (var j in bbFields) {
                fe = new blackberry.find.FilterExpression(bbFields[j], "REGEX", filter);
                if (filterExpression === null) {
                    filterExpression = fe;
                } else {
                    // combine the filters
                    filterExpression = new blackberry.find.FilterExpression(filterExpression, "OR", fe);
                }
            }
        }
    }

    return filterExpression;
};

/**
 * Creates a BlackBerry Address object from this ContactAddress object.
 * @return {blackberry.pim.Address} a BlackBerry address object
 */
ContactAddress.prototype.toBlackBerryAddress = function() {
    
    var bbAddress = new blackberry.pim.Address();
    bbAddress.address1 = this.streetAddress || "";
    bbAddress.city = this.locality || "";
    bbAddress.stateProvince = this.region || "";
    bbAddress.zipPostal = this.postalCode || "";
    bbAddress.country = this.country || "";
    
    return bbAddress;
};

/**
 * Factory method. Creates a ContactAddress object from a BlackBerry Address object.
 * @param {blackberry.pim.Address} bbAddress a BlakcBerry Address object
 * @return {ContactAddress} a contact address object or null if the specified
 * address is null of not a blackberry.pim.Address object
 */
ContactAddress.fromBlackBerryAddress = function(bbAddress) {
    
    if (!bbAddress || bbAddress instanceof blackberry.pim.Address === false) {
        return null;
    }
    
    var address1 = bbAddress.address1 || "";
    var address2 = bbAddress.address2 || "";
    var streetAddress = address1 + ", " + address2;
    var locality = bbAddress.city || "";
    var region = bbAddress.stateProvince || "";
    var postalCode = bbAddress.zipPostal || "";
    var country = bbAddress.country || "";
    var formatted = streetAddress + ", " + locality + ", " + region + ", " + postalCode + ", " + country;

    return new ContactAddress(formatted, streetAddress, locality, region, postalCode, country);
};

/**
 * Factory method. Creates a Contact object from a BlackBerry Contact object, 
 * copying only the fields specified.
 * @param {blackberry.pim.Contact} bbContact BlackBerry Contact object
 * @param {String[]} fields array of contact fields that should be copied
 * @return {Contact} a contact object containing the specified fields 
 * or null if the specified contact is null
 */
BlackBerryContacts.createContact = function(bbContact, fields) {

    if (!bbContact) {
        return null;
    }
    
    // construct a new contact object
    // always copy the contact id and displayName fields
    var contact = new Contact(bbContact.uid, bbContact.title);
    
    // nothing to do
    if (!fields) {
      return contact;
    }
    
    // add the fields specified
    for (var i in fields) {
        var field = fields[i];
        if (!field) {
            continue;
        }
        
        // name
        if (field.indexOf('name') === 0) {
            var formattedName = bbContact.firstName + ' ' + bbContact.lastName;
            contact.name = new ContactName(formattedName, bbContact.lastName, bbContact.firstName, null, null, null);
        } 
        // phone numbers        
        else if (field.indexOf('phoneNumbers') === 0) {
            var phoneNumbers = [];
            if (bbContact.homePhone) {
                phoneNumbers.push(new ContactField('home', bbContact.homePhone));
            }
            if (bbContact.homePhone2) {
                phoneNumbers.push(new ContactField('home', bbContact.homePhone2));
            }
            if (bbContact.workPhone) {
                phoneNumbers.push(new ContactField('work', bbContact.workPhone));
            }
            if (bbContact.workPhone2) {
                phoneNumbers.push(new ContactField('work', bbContact.workPhone2));
            }
            if (bbContact.mobilePhone) {
                phoneNumbers.push(new ContactField('mobile', bbContact.mobilePhone));
            }
            if (bbContact.faxPhone) {
                phoneNumbers.push(new ContactField('fax', bbContact.faxPhone));
            }
            if (bbContact.pagerPhone) {
                phoneNumbers.push(new ContactField('pager', bbContact.pagerPhone));
            }
            if (bbContact.otherPhone) {
                phoneNumbers.push(new ContactField('other', bbContact.otherPhone));
            }
            contact.phoneNumbers = phoneNumbers;
        }
        // emails
        else if (field.indexOf('emails') === 0) {
            var emails = [];
            if (bbContact.email1) {
                emails.push(new ContactField(null, bbContact.email1, null));
            }
            if (bbContact.email2) { 
                emails.push(new ContactField(null, bbContact.email2, null));
            }
            if (bbContact.email3) { 
                emails.push(new ContactField(null, bbContact.email3, null));
            }
            contact.emails = emails;
        }
        // addresses
        else if (field.indexOf('addresses') === 0) {
            var addresses = [];
            if (bbContact.homeAddress) {
                addresses.push(ContactAddress.fromBlackBerryAddress(bbContact.homeAddress));
            }
            if (bbContact.workAddress) {
                addresses.push(ContactAddress.fromBlackBerryAddress(bbContact.workAddress));
            }
            contact.addresses = addresses;
        }
        // birthday
        else if (field.indexOf('birthday') === 0) {
            contact.birthday = bbContact.birthday;
        }
        // anniversary
        else if (field.indexOf('anniversary') === 0) {
            contact.anniversary = bbContact.anniversary;
        }
        // note
        else if (field.indexOf('note') === 0) {
            contact.note = bbContact.note;
        }
        // organizations
        else if (field.indexOf('organizations') === 0) {
            var organizations = [];
            if (bbContact.company || bbContact.jobTitle) {
                organizations.push(new ContactOrganization(bbContact.company, null, 
                        bbContact.jobTitle, null, null, null, null));
            }
            contact.organizations = organizations;
        }
        // urls
        else if (field.indexOf('urls') === 0) {
            var urls = [];
            if (bbContact.webpage) {
                urls.push(new ContactField(null, bbContact.webpage));
            }
            contact.urls = urls;
        }
    }
    
    return contact;
};

PhoneGap.addConstructor(function() {
    if(typeof navigator.service === "undefined") navigator.service = new Object();
    if(typeof navigator.service.BlackBerryContacts === "undefined") navigator.service.BlackBerryContacts = new BlackBerryContacts();
});
