
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * ContactError
 */
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
 * Contact object.
 */
var Contact = Contact || (function() {
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
    function Contact(id, displayName, name, nickname, phoneNumbers, emails, addresses,
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
     * Persists contact to device storage.
     */
    Contact.prototype.save = function(success, fail) {
        try {
            // save the contact and store it's unique id
            this.id = saveToDevice(this);        
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
     * 
     * @param success success callback
     * @param fail error callback
     */
    Contact.prototype.remove = function(success, fail) {
        try {
            // retrieve contact from device by id
            var bbContact = null;
            if (this.id) {
                bbContact = findByUniqueId(this.id);
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
     * 
     * @return copy of this Contact
     */
    Contact.prototype.clone = function() {
        var clonedContact = PhoneGap.clone(this);
        clonedContact.id = null;
        return clonedContact;
    };
    
    //------------------
    // Utility functions
    //------------------
    
    /**
     * Retrieves a BlackBerry contact from the device by unique id.
     * 
     * @param uid Unique id of the contact on the device
     * @return {blackberry.pim.Contact} BlackBerry contact or null if contact 
     * with specified id is not found
     */
    var findByUniqueId = function(uid) {
        if (!uid) {
            return null;
        }
        var bbContacts = blackberry.pim.Contact.find(
                new blackberry.find.FilterExpression("uid", "==", uid));
        return bbContacts[0] || null;
    };

    /**
     * Creates a BlackBerry contact object from the W3C Contact object 
     * and persists it to device storage.
     * 
     * @param {Contact} contact The contact to save
     * @return id of the saved contact
     */
    var saveToDevice = function(contact) {

        if (!contact) {
            return;
        }
        
        var bbContact = null;
        var update = false;

        // if the underlying BlackBerry contact already exists, retrieve it for update
        if (contact.id) {
            // we must attempt to retrieve the BlackBerry contact from the device 
            // because this may be an update operation
            bbContact = findByUniqueId(contact.id);
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
            if (contact.name.honorificPrefix !== null) {
                bbContact.title = contact.name.honorificPrefix;
            }
        }
        
        // display name
        if (contact.displayName !== null) {
            bbContact.user1 = contact.displayName;
        }
        
        // note
        if (contact.note !== null) {
            bbContact.note = contact.note;
        }

        // birthday
        //
        // user may pass in Date object or a string representation of a date 
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
            for (var i=0; i<contact.emails.length; i+=1) {
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
            for (var i=0; i<contact.phoneNumbers.length; i+=1) {
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
            for (var i=0; i<contact.addresses.length; i+=1) {
                address = contact.addresses[i];
                if (!address || address instanceof ContactAddress === false) {
                    continue; 
                }
                
                if (bbHomeAddress === null) {
                    bbHomeAddress = createBlackBerryAddress(address);
                    bbContact.homeAddress = bbHomeAddress;
                }
                else if (bbWorkAddress === null) {
                    bbWorkAddress = createBlackBerryAddress(address);
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
            for (var i=0; i<contact.urls.length; i+=1) {
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
            for (var i=0; i<contact.organizations.length; i+=1) {
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

        // categories
        if (contact.categories && contact.categories instanceof Array) {   
            bbContact.categories = [];
            var category = null;
            for (var i=0; i<contact.categories.length; i+=1) {
                category = contact.categories[i];
                if (typeof category == "string") {
                    bbContact.categories.push(category);
                }
            }
        }    
        
        // save to device
        bbContact.save();

        // invoke native side to save photo
        // fail gracefully if photo URL is no good, but log the error
        if (contact.photos && contact.photos instanceof Array) {
            var photo = null;
            for (var i=0; i<contact.photos.length; i+=1) {
                photo = contact.photos[i];
                if (!photo || !photo.value) { 
                    continue; 
                }
                PhoneGap.exec(
                        // success
                        function() {
                        },
                        // fail
                        function(e) {
                            console.log('Contact.setPicture failed:' + e);
                        },
                        "Contact", "setPicture", [bbContact.uid, photo.type, photo.value]
                );
                break;
            }
        }
        
        return bbContact.uid;
    };
    
    /**
     * Creates a BlackBerry Address object from a W3C ContactAddress.
     * 
     * @return {blackberry.pim.Address} a BlackBerry address object
     */
    var createBlackBerryAddress = function(address) {
        var bbAddress = new blackberry.pim.Address();
        
        if (!address) {
            return bbAddress;
        }
        
        bbAddress.address1 = address.streetAddress || "";
        bbAddress.city = address.locality || "";
        bbAddress.stateProvince = address.region || "";
        bbAddress.zipPostal = address.postalCode || "";
        bbAddress.country = address.country || "";
        
        return bbAddress;
    };
    
    return Contact;
}());

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

/**
 * navigator.service.contacts
 * 
 * Provides access to the device contacts database.
 */
(function() {
    /**
     * Check that navigator.service.contacts has not been initialized.
     */
    if (navigator.service && typeof navigator.service.contacts !== 'undefined') {
        return;
    }
    
    /**
     * @constructor
     */
    var Contacts = function() {
    };
    
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
        var filterExpression = buildFilterExpression(fields, filter); 

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
                contacts.push(createContact(bbContacts[i], fields));
            }
        }
        
        // return results
        if (success && success instanceof Function) {
            success(contacts);
        } else {
            console.log("Error invoking Contacts.find success callback.");
        }
    };
    
    //---------------
    // Find utilities
    //---------------
    
    /**
     * Mappings for each Contact field that may be used in a find operation. 
     * Maps W3C Contact fields to one or more fields in a BlackBerry 
     * contact object.
     *
     * Example: user searches with a filter on the Contact 'name' field:
     *
     * <code>Contacts.find(['name'], onSuccess, onFail, {filter:'Bob'});</code>
     * 
     * The 'name' field does not exist in a BlackBerry contact.  Instead, a
     * filter expression will be built to search the BlackBerry contacts using
     * the BlackBerry 'title', 'firstName' and 'lastName' fields.   
     */
    var fieldMappings = {
         "id"                        : "uid",
         "displayName"               : "user1", 
         "name"                      : [ "title", "firstName", "lastName" ],
         "name.formatted"            : [ "title", "firstName", "lastName" ],
         "name.givenName"            : "firstName",
         "name.familyName"           : "lastName",
         "name.honorificPrefix"      : "title",
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
         "note"                      : "note",
         "categories"                : "categories",
         "urls"                      : "webpage",
         "urls.value"                : "webpage"
    };
    
    /**
     * Builds a BlackBerry filter expression for contact search using the 
     * contact fields and search filter provided.  
     * 
     * @param {String[]} fields Array of Contact fields to search
     * @param {String} filter Filter, or search string
     * @return filter expression or null if fields is empty or filter is null or empty
     */
    var buildFilterExpression = function(fields, filter) {
        
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
        for (var i = 0; i < filter.length; i++) {
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
                var bbFields = fieldMappings[fields[i]];
                
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
                        filterExpression = new blackberry.find.FilterExpression(
                                filterExpression, "OR", fe);
                    }
                }
            }
        }

        return filterExpression;
    };    
    
    /**
     * Creates a Contact object from a BlackBerry Contact object, 
     * copying only the fields specified.
     * 
     * @param {blackberry.pim.Contact} bbContact BlackBerry Contact object
     * @param {String[]} fields array of contact fields that should be copied
     * @return {Contact} a contact object containing the specified fields 
     * or null if the specified contact is null
     */
    var createContact = function(bbContact, fields) {

        if (!bbContact) {
            return null;
        }
        
        // construct a new contact object
        // always copy the contact id and displayName fields
        var contact = new Contact(bbContact.uid, bbContact.user1);
        
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
                var formattedName = bbContact.title + ' ' + 
                    bbContact.firstName + ' ' + bbContact.lastName;
                contact.name = new ContactName(formattedName, bbContact.lastName, 
                        bbContact.firstName, null, bbContact.title, null);
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
                    addresses.push(createContactAddress(bbContact.homeAddress));
                }
                if (bbContact.workAddress) {
                    addresses.push(createContactAddress(bbContact.workAddress));
                }
                contact.addresses = addresses;
            }
            // birthday
            else if (field.indexOf('birthday') === 0) {
                contact.birthday = bbContact.birthday;
            }
            // note
            else if (field.indexOf('note') === 0) {
                contact.note = bbContact.note;
            }
            // organizations
            else if (field.indexOf('organizations') === 0) {
                var organizations = [];
                if (bbContact.company || bbContact.jobTitle) {
                    organizations.push(
                        new ContactOrganization(bbContact.company, null, bbContact.jobTitle));
                }
                contact.organizations = organizations;
            }
            // categories
            else if (field.indexOf('categories') === 0) {
                contact.categories = bbContact.categories; 
            }
            // urls
            else if (field.indexOf('urls') === 0) {
                var urls = [];
                if (bbContact.webpage) {
                    urls.push(new ContactField(null, bbContact.webpage));
                }
                contact.urls = urls;
            }
            // photos
            else if (field.indexOf('photos') === 0) {
                var photos = [];
                // The BlackBerry Contact object will have a picture attribute
                // with Base64 encoded image
                if (bbContact.picture) {
                    photos.push(new ContactField('base64', bbContact.picture));
                }
                contact.photos = photos;
            }
        }

        return contact;
    };    
    
    /**
     * Create a W3C ContactAddress object from a BlackBerry Address object.
     * 
     * @param {blackberry.pim.Address} bbAddress a BlakcBerry Address object
     * @return {ContactAddress} a contact address object or null if the specified
     * address is null of not a blackberry.pim.Address object
     */
    var createContactAddress = function(bbAddress) {
        
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
     * Define navigator.service.contacts object.
     */
    PhoneGap.addConstructor(function() {
        if(typeof navigator.service === "undefined") {
            navigator.service = {};
        }
        navigator.service.contacts = new Contacts();
    });
}());
