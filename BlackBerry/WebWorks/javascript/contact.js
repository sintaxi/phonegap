
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

/**
 * Contains information about a single contact.  
 * @param {DOMString} id unique identifier
 * @param {DOMString} displayName
 * @param {ContactName} name 
 * @param {DOMString} nickname
 * @param {ContactField[]} phoneNumbers array of phone numbers
 * @param {ContactField[]} emails array of email addresses
 * @param {ContactAddress[]} addresses array of addresses
 * @param {ContactField[]} ims instant messaging user ids
 * @param {ContactOrganization[]} organizations 
 * @param {DOMString} revision date contact was last updated
 * @param {Date} birthday contact's birthday
 * @param {DOMString} gender contact's gender
 * @param {DOMString} note user notes about contact
 * @param {ContactField[]} photos
 * @param {DOMString[]} categories 
 * @param {ContactField[]} urls contact's web sites
 * @param {DOMString} timezone time zone 
 */
var Contact = function(id, displayName, name, nickname, phoneNumbers, emails, addresses,
    ims, organizations, revision, birthday, gender, note, photos, categories, urls, timezone) {
    this.id = id || null;
    this.displayName = displayName || null;
    this.name = name || null; // ContactName
    this.nickname = nickname || null;
    this.phoneNumbers = phoneNumbers || null; // ContactField[]
    this.emails = emails || null; // ContactField[]
    this.addresses = addresses || null; // ContactAddress[]
    this.ims = ims || null; // ContactField[]
    this.organizations = organizations || null; // ContactOrganization[]
    this.revision = revision || null;
    this.birthday = birthday || null;
    this.gender = gender || null;
    this.note = note || null;
    this.photos = photos || null; // ContactField[]
    this.categories = categories || null; // DOMString[]
    this.urls = urls || null; // ContactField[]
    this.timezone = timezone;
};

/**
 * Contact name.
 * @param formatted full name formatted for display
 * @param familyName family or last name
 * @param givenName given or first name
 * @param middle middle name
 * @param prefix honorific prefix or title
 * @param suffix honorific suffix
 */
var ContactName = function(formatted, familyName, givenName, middle, prefix, suffix) {
    this.formatted = formatted || null;
    this.familyName = familyName || null;
    this.givenName = givenName || null;
    this.middleName = middle || null;
    this.honorificPrefix = prefix || null;
    this.honorificSuffix = suffix || null;
};

/**
 * Generic contact field.
 * @param type contains the type of information for this field, e.g. 'home', 'mobile'
 * @param value contains the value of this field
 * @param pref indicates whether this instance is preferred 
 */
var ContactField = function(type, value, pref) {
    this.type = type || null;
    this.value = value || null;
    this.pref = pref || false;
};

/**
 * Contact address.
 * @param formatted full physical address, formatted for display
 * @param streetAddress street address
 * @param locality locality or city
 * @param region region or state
 * @param postalCode postal or zip code
 * @param country country name
 */
var ContactAddress = function(formatted, streetAddress, locality, region, postalCode, country) {
    this.formatted = formatted || null;
    this.streetAddress = streetAddress || null;
    this.locality = locality || null;
    this.region = region || null;
    this.postalCode = postalCode || null;
    this.country = country || null;
};

/**
 * Contact organization.
 * @param name name of organization
 * @param dept department
 * @param title job title
 */
var ContactOrganization = function(name, dept, title) {
    this.name = name || null;
    this.department = dept || null;
    this.title = title || null;
};

/**
 * Represents a group of Contacts. 
 */
var Contacts = function() {
    this.inProgress = false;
    this.records = [];
};

var ContactError = function(code) {
    this.code = code;
};

ContactError.UNKNOWN_ERROR = 0;
ContactError.INVALID_ARGUMENT_ERROR = 1;
ContactError.NOT_FOUND_ERROR = 2;
ContactError.TIMEOUT_ERROR = 3;
ContactError.PENDING_OPERATION_ERROR = 4;
ContactError.IO_ERROR = 5;
ContactError.NOT_SUPPORTED_ERROR = 6;
ContactError.PERMISSION_DENIED_ERROR = 20;

/**
 * This function creates a new contact, but it does not persist the contact
 * to device storage.  To persist the contact to device storage, invoke
 * <code>contact.save()</code>.
 */
Contacts.prototype.create = function(properties) {
    var contact = new Contact();
    for (var i in properties) {
        if (contact[i] !== 'undefined') {
            contact[i] = properties[i];
        }
    }
    return contact;
};

/**
 * Persists contact to device storage.
 */
Contact.prototype.save = function(success, fail) {
    
    try {
        // save the contact and store it's unique id
        this.id = BlackBerryContacts.saveToDevice(this);        
        if (success) {
            success(this);
        }
    } catch (e) {
        console.log('Error saving contact: ' + e);
        if (fail) {
            fail(new ContactError(ContactError.UNKNOWN_ERROR));
        }
    }
};

/**
 * Removes contact from device storage.
 * @param success success callback
 * @param fail error callback
 */
Contact.prototype.remove = function(success, fail) {

    try {
        // retrieve contact from device by id
        var bbContact = null;
        if (this.id) {
            bbContact = BlackBerryContacts.findByUniqueId(this.id);
        }
        
        // if contact was found, remove it
        if (bbContact) {
            console.log('removing contact: ' + bbContact.uid);
            bbContact.remove();
            if (success) {
                success(this);
            }
        }
        // attempting to remove a contact that hasn't been saved
        else if (fail) { 
            fail(new ContactError(ContactError.NOT_FOUND_ERROR));            
        }
    } 
    catch (e) {
        console.log('Error removing contact ' + this.id + ": " + e);
        if (fail) { 
            fail(new ContactError(ContactError.UNKNOWN_ERROR));
        }
    }
};

/**
 * Creates a deep copy of this Contact.
 * @return copy of this Contact
 */
Contact.prototype.clone = function() {
    var clonedContact = PhoneGap.clone(this);
    clonedContact.id = null;
    return clonedContact;
};

/**
 * Returns an array of Contacts matching the search criteria.
 * @return array of Contacts matching search criteria
 */
Contacts.prototype.find = function(fields, success, fail, options) {

    // default is to return multiple contacts (-1 on BlackBerry)
    var numContacts = -1;

    // search options
    var filter = null;
    if (options) {
        // return multiple objects?
        if (options.multiple === false) {
            numContacts = 1;
        }
        filter = options.filter;
    }
    
    // build the filter expression to use in find operation 
    var filterExpression = BlackBerryContacts.buildFilterExpression(fields, filter); 

    // find matching contacts
    // Note: the filter expression can be null here, in which case, the find won't filter
    var bbContacts = blackberry.pim.Contact.find(filterExpression, null, numContacts);
    
    // convert to Contact from blackberry.pim.Contact
    var contacts = [];
    for (var i in bbContacts) {
        if (bbContacts[i]) { 
            // W3C Contacts API specification states that only the fields
            // in the search filter should be returned, so we create 
            // a new Contact object, copying only the fields specified
            contacts.push(BlackBerryContacts.createContact(bbContacts[i], fields));
        }
    }
    
    // return results
    if (success && success instanceof Function) {
        success(contacts);
    } else {
        console.log("Error invoking Contacts.find success callback.");
    }
};

/**
 * Contact search criteria.
 * @param filter string-based search filter with which to search and filter contacts
 * @param multiple indicates whether multiple contacts should be returned (defaults to true)
 * @param updatedSince return only records that have been updated after the specified timm
 */
var ContactFindOptions = function(filter, multiple, updatedSince) {
    this.filter = filter || '';
    this.multiple = multiple || true;
    this.updatedSince = updatedSince || '';
};

PhoneGap.addConstructor(function() {
    if(typeof navigator.service === "undefined") navigator.service = new Object();
    if(typeof navigator.service.contacts === "undefined") navigator.service.contacts = new Contacts();
});
