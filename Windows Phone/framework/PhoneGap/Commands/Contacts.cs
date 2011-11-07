/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2011, Microsoft Corporation
 * Copyright (c) 2011, Jesse MacFadyen.
 */

using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using Microsoft.Phone.Tasks;
using Microsoft.Phone.UserData;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using DeviceContacts = Microsoft.Phone.UserData.Contacts;
using System.Diagnostics;
using System.Linq;


namespace WP7GapClassLib.PhoneGap.Commands
{
    [DataContract]
    public class SearchOptions
    {
        [DataMember]
        public string filter { get; set; }
        [DataMember]
        public bool multiple { get; set; }
    }

    [DataContract]
    public class ContactSearchParams
    {
        [DataMember]
        public string[] fields { get; set; }
        [DataMember]
        public SearchOptions options { get; set; }
    }

    [DataContract]
    public class JSONContactAddress
    {
        [DataMember]
        public string formatted { get; set; }
        [DataMember]
        public string type { get; set; }
        [DataMember]
        public string streetAddress { get; set; }
        [DataMember]
        public string locality { get; set; }
        [DataMember]
        public string region { get; set; }
        [DataMember]
        public string postalCode { get; set; }
        [DataMember]
        public string country { get; set; }
        [DataMember]
        public bool pref { get; set; }
    }

    [DataContract]
    public class JSONContactName
    {
        [DataMember]
        public string formatted { get; set; }
        [DataMember]
        public string familyName { get; set; }
        [DataMember]
        public string givenName { get; set; }
        [DataMember]
        public string middleName { get; set; }
        [DataMember]
        public string honorificPrefix { get; set; }
        [DataMember]
        public string honorificSuffix { get; set; }
    }

    [DataContract]
    public class JSONContactField
    {
        [DataMember]
        public string type { get; set; }
        [DataMember]
        public string value { get; set; }
        [DataMember]
        public bool pref { get; set; }
    }

    [DataContract]
    public class JSONContactOrganization
    {
        [DataMember]
        public string type { get; set; }
        [DataMember]
        public string name { get; set; }
        [DataMember]
        public bool pref { get; set; }
        [DataMember]
        public string department { get; set; }
        [DataMember]
        public string title { get; set; }
    }

    [DataContract]
    public class JSONContact
    {
        [DataMember]
        public string id { get; set; }
        [DataMember]
        public string rawId { get; set; }
        [DataMember]
        public string displayName { get; set; }
        [DataMember]
        public string nickname { get; set; }
        [DataMember]
        public string note { get; set; }

        [DataMember]
        public JSONContactName name { get; set; }

        [DataMember]
        public JSONContactField[] emails { get; set; }

        [DataMember]
        public JSONContactField[] phoneNumbers { get; set; }

        [DataMember]
        public JSONContactField[] ims { get; set; }

        [DataMember]
        public JSONContactField[] photos { get; set; }

        [DataMember]
        public JSONContactField[] categories { get; set; }

        [DataMember]
        public JSONContactField[] urls { get; set; }

        [DataMember]
        public JSONContactOrganization[] organizations { get; set; }

        [DataMember]
        public JSONContactAddress[] addresses { get; set; }
    }

    public class Contacts : BaseCommand
    {

        public Contacts()
        {

        }

        private void saveContactTask_Completed(object sender, SaveContactResult e)
        {
            switch (e.TaskResult)
            {
                case TaskResult.OK:
                    // successful save
                    MessageBoxResult res = MessageBox.Show("contact saved", "Alert", MessageBoxButton.OK);
                    break;
                case TaskResult.Cancel:
                    // user cancelled
                    break;
                case TaskResult.None:
                    // no info about result is available
                    break;
            }
        }

        // refer here for contact properties we can access: http://msdn.microsoft.com/en-us/library/microsoft.phone.tasks.savecontacttask_members%28v=VS.92%29.aspx
        public void save(string jsonContact)
        {
            Debug.WriteLine("Saving Contact :: " + jsonContact);

            JSONContact contact = JSON.JsonHelper.Deserialize<JSONContact>(jsonContact);

            SaveContactTask contactTask = new SaveContactTask();

            if (contact.nickname != null)
            {
                contactTask.Nickname = contact.nickname;
            }
            if (contact.urls != null && contact.urls.Length > 0)
            {
                contactTask.Website = contact.urls[0].value;
            }
            if (contact.note != null)
            {
                contactTask.Notes = contact.note;
            }

            #region contact.name
            if (contact.name != null)
            {
                if (contact.name.givenName != null)
                    contactTask.FirstName = contact.name.givenName;
                if (contact.name.familyName != null)
                    contactTask.LastName = contact.name.familyName;
                if (contact.name.middleName != null)
                    contactTask.MiddleName = contact.name.middleName;
                if (contact.name.honorificSuffix != null)
                    contactTask.Suffix = contact.name.honorificSuffix;
                if (contact.name.honorificPrefix != null)
                    contactTask.Title = contact.name.honorificPrefix;
            }
            #endregion

            #region contact.org
            if (contact.organizations != null && contact.organizations.Count() > 0)
            {
                contactTask.Company = contact.organizations[0].name;
                contactTask.JobTitle = contact.organizations[0].title;
            }
            #endregion

            #region contact.phoneNumbers
            if (contact.phoneNumbers != null && contact.phoneNumbers.Length > 0)
            {
                foreach (JSONContactField field in contact.phoneNumbers)
                {
                    string fieldType = field.type.ToLower();
                    if (fieldType == "work")
                    {
                        contactTask.WorkPhone = field.value;
                    }
                    else if (fieldType == "home")
                    {
                        contactTask.HomePhone = field.value;
                    }
                    else if (fieldType == "mobile")
                    {
                        contactTask.MobilePhone = field.value;
                    }
                }
            }
            #endregion

            #region contact.emails
            if (contact.emails != null && contact.emails.Length > 0)
            {
                foreach (JSONContactField field in contact.emails)
                {
                    string fieldType = field.type.ToLower();
                    if (fieldType == "work")
                    {
                        contactTask.WorkEmail = field.value;
                    }
                    else if (fieldType == "home" || fieldType == "personal")
                    {
                        contactTask.PersonalEmail = field.value;
                    }
                    else
                    {
                        contactTask.OtherEmail = field.value;
                    }
                }
            }
            #endregion

            #region contact.addresses
            if (contact.addresses != null && contact.addresses.Length > 0)
            {
                foreach (JSONContactAddress address in contact.addresses)
                {
                    string fieldType = address.type.ToLower();
                    if (fieldType == "work")
                    {
                        contactTask.WorkAddressCity = address.locality;
                        contactTask.WorkAddressCountry = address.country;
                        contactTask.WorkAddressState = address.region;
                        contactTask.WorkAddressStreet = address.streetAddress;
                        contactTask.WorkAddressZipCode = address.postalCode;
                    }
                    else if (fieldType == "home" || fieldType == "personal")
                    {
                        contactTask.HomeAddressCity = address.locality;
                        contactTask.HomeAddressCountry = address.country;
                        contactTask.HomeAddressState = address.region;
                        contactTask.HomeAddressStreet = address.streetAddress;
                        contactTask.HomeAddressZipCode = address.postalCode;
                    }
                    else
                    {
                        // no other address fields available ...
                        Debug.WriteLine("Creating contact with unsupported address type :: " + address.type);
                    }
                }
            }
            #endregion


            contactTask.Completed += new EventHandler<SaveContactResult>(contactTask_Completed);
            contactTask.Show();

            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, new string[]{}));
        }

        void contactTask_Completed(object sender, SaveContactResult e)
        {
            SaveContactTask task = sender as SaveContactTask;

            if (e.TaskResult == TaskResult.OK)
            {
                DeviceContacts deviceContacts = new DeviceContacts();
                deviceContacts.SearchCompleted += new EventHandler<ContactsSearchEventArgs>(postAdd_SearchCompleted);
                deviceContacts.SearchAsync(task.FirstName + " " + task.LastName, FilterKind.DisplayName, task);
            }
            else if (e.TaskResult == TaskResult.Cancel)
            {

            }
        }

        void postAdd_SearchCompleted(object sender, ContactsSearchEventArgs e)
        {
            if (e.Results.Count() > 0)
            {
                List<Contact> foundContacts = new List<Contact>();

                int n = (from Contact contact in e.Results select contact.GetHashCode()).Max();
                Contact newContact = (from Contact contact in e.Results
                                      where contact.GetHashCode() == n
                                      select contact).First();

                DispatchCommandResult(new PluginResult(PluginResult.Status.OK, FormatJSONContact(newContact,null)));
            }
            else
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.NO_RESULT));
            }
        }


        // TODO: we need to be able to pass a search param in.
        public void search(string searchCriteria)
        {
            ContactSearchParams searchParams = JSON.JsonHelper.Deserialize<ContactSearchParams>(searchCriteria);

            DeviceContacts deviceContacts = new DeviceContacts();
            deviceContacts.SearchCompleted += new EventHandler<ContactsSearchEventArgs>(contacts_SearchCompleted);

            // default is to search all fields
            FilterKind filterKind = FilterKind.None;
            // if only one field is specified, we will try the 3 available DeviceContact search filters
            if (searchParams.fields.Count() == 1)
            {
                if (searchParams.fields.Contains("name"))
                {
                    filterKind = FilterKind.DisplayName;
                }
                else if (searchParams.fields.Contains("emails"))
                {
                    filterKind = FilterKind.EmailAddress;
                }
                else if (searchParams.fields.Contains("phoneNumbers"))
                {
                    filterKind = FilterKind.PhoneNumber;
                }
            }

            try
            {
                deviceContacts.SearchAsync(searchParams.options.filter, filterKind, searchParams);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("search contacts exception :: " + ex.Message);
            }
        }

        private void contacts_SearchCompleted(object sender, ContactsSearchEventArgs e)
        {
            ContactSearchParams searchParams = (ContactSearchParams)e.State;

            List<Contact> foundContacts = null;

            // if we have multiple search fields
            if (searchParams.options.filter.Length > 0 && searchParams.fields.Count() > 1)
            {
                foundContacts = new List<Contact>();
                if(searchParams.fields.Contains("emails"))
                {
                    foundContacts.AddRange(from Contact con in e.Results
                                       from ContactEmailAddress a in con.EmailAddresses
                                       where a.EmailAddress.Contains(searchParams.options.filter)
                                       select con);
                }
                if (searchParams.fields.Contains("displayName"))
                {
                    foundContacts.AddRange(from Contact con in e.Results
                                           where con.DisplayName.Contains(searchParams.options.filter)
                                            select con);
                }
                if (searchParams.fields.Contains("name"))
                {
                    foundContacts.AddRange(from Contact con in e.Results
                                           where con.CompleteName != null && con.CompleteName.ToString().Contains(searchParams.options.filter)
                                           select con);
                }
                if (searchParams.fields.Contains("phoneNumbers"))
                {
                    foundContacts.AddRange(from Contact con in e.Results
                                           from ContactPhoneNumber a in con.PhoneNumbers
                                           where a.PhoneNumber.Contains(searchParams.options.filter)
                                           select con);
                }
                if (searchParams.fields.Contains("urls"))
                {
                    foundContacts.AddRange(from Contact con in e.Results
                                           from string a in con.Websites
                                           where a.Contains(searchParams.options.filter)
                                           select con);
                }
            }
            else
            {
                foundContacts = new List<Contact>(e.Results);
            }

            List<string> contactList = new List<string>();

            foreach(Contact cont in foundContacts)
            {
                Debug.WriteLine(cont.ToString() + " : " + cont.DisplayName + " : " + cont.GetHashCode().ToString());
            }


            IEnumerable<Contact> distinctContacts = foundContacts.Distinct();
            
            foreach (Contact contact in distinctContacts)
            {
                contactList.Add(FormatJSONContact(contact, null));
                //contactList.Add("{" + String.Format(contactFormat, contact.DisplayName) + "}");
                if (!searchParams.options.multiple)
                {
                    break; // just return the first item
                }
            }

            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, contactList.ToArray()));

        }

        private string FormatJSONPhoneNumbers(Contact con)
        {
            string retVal = "";
            foreach (ContactPhoneNumber number in con.PhoneNumbers)
            {
                retVal += "\"" +  number.PhoneNumber + "\",";
            }
            return retVal.TrimEnd(',');
        }

        private string FormatJSONEmails(Contact con)
        {
            string retVal = "";
            foreach (ContactEmailAddress address in con.EmailAddresses)
            {
                retVal += "\"" + address.EmailAddress + "\",";
            }
            return retVal.TrimEnd(',');
        }

        private string FormatJSONAddresses(Contact con)
        {
            string retVal = "";
            foreach (ContactAddress address in con.Addresses)
            {
                retVal += "\"" + address.ToString() + "\",";
            }
            return retVal.TrimEnd(',');
        }

        private string FormatJSONWebsites(Contact con)
        {
            string retVal = "";
            foreach (string website in con.Websites)
            {
                retVal += "\"" + website + "\",";
            }
            return retVal.TrimEnd(',');
        }

        private string FormatJSONContact(Contact con, string[] fields)
        {
            string contactFormatStr = "\"id\":\"{0}\"," +
                                      "\"displayName\":\"{1}\"," +
                                      "\"nickname\":\"{2}\"," +
                                      "\"phoneNumbers\":[{3}]," +
                                      "\"emails\":[{4}]," +
                                      "\"addresses\":[{5}]," +
                                      "\"urls\":[{6}]";

            string jsonContact = String.Format(contactFormatStr, 
                                               con.GetHashCode(), 
                                               con.DisplayName, 
                                               con.DisplayName, 
                                               FormatJSONPhoneNumbers(con), 
                                               FormatJSONEmails(con),
                                               FormatJSONAddresses(con),
                                               FormatJSONWebsites(con));

            jsonContact = "{" + jsonContact + "}";

            //Debug.WriteLine("jsonContact = " + jsonContact);

            return jsonContact;
        }
    }
}
