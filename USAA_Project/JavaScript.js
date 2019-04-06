//we're using a stacked card approach for our main viewing area
//this array holds the ids of our cards and the method
//allows us to easly switch the interface from one to the other
var contentPanels = ['logonPanel','departmentsPanel', 'listPanel', 'editAccountPanel', 'requestsPanel'];
//this function toggles which panel is showing, and also clears data from all panels
function showPanel(panelId) {
    clearData();
    for (var i = 0; i < contentPanels.length; i++) {
        if (panelId == contentPanels[i]) {
            $("#" + contentPanels[i]).css("visibility", "visible");
        }
        else {
            $("#" + contentPanels[i]).css("visibility", "hidden");
        }
    }
}

//this function clears data from all panels
function clearData() {
    $("#accountsBox").empty();
    $("#requestsBox").empty();
    clearNewAccount();
    clearLogon();
    clearEditAccount();
}

//HERE'S AN EXAMPLE OF AN AJAX CALL WITH JQUERY!
function LogOn(userId, pass) {
    var webMethod = "AccountServices.asmx/LogOn";
    var parameters = "{\"uid\":\"" + encodeURI(userId) + "\",\"pass\":\"" + encodeURI(pass) + "\"}";

    //jQuery ajax method
    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d) {
                //server replied true, so show the accounts panel
                showPanel('departmentsPanel');
                LoadAccounts();
            }
            else {
                alert("login failed");
            }
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//List all accounts for admins to view
var accountsArray;
//to begin with, we assume that the account is not an admin
var admin = false;

//this function grabs accounts and loads our account window
function LoadAccounts() {
    var webMethod = "AccountServices.asmx/GetAccounts";
    $.ajax({
        type: "POST",
        url: webMethod,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d.length > 0) {
                //let's put our accounts that we get from the
                //server into our accountsArray variable
                //so we can use them in other functions as well
                accountsArray = msg.d;
                //this clears out the div that will hold our account info
                $("#accountsBox").empty();
                //again, we assume we're not an admin unless we see data from the server
                //that we know only admins can see
                admin = false;
                for (var i = 0; i < accountsArray.length; i++) {
                    //we grab on to a specific html element in jQuery
                    //by using a  # followed by that element's id.
                    var acct;
                    //if they have access to admin-level info (like userid and password) then
                    //create output that has an edit option
                    if (accountsArray[i].userId != null) {
                        acct = "<div class='accountRow' id='acct" + accountsArray[i].id + "'>" +
                            "<a class='nameTag' href='mailto:" + accountsArray[i].email + "'>" +
                            accountsArray[i].firstName + " " + accountsArray[i].lastName +
                            "</a> <a href='#' onclick='LoadAccount(" + accountsArray[i].id + ")' class='optionsTag'>edit</a></div><hr>"
                        admin = true;
                        $("#accountsBox").append(
                            //anything we throw at our panel in the form of text
                            //will be added to the contents of that panel.  Here
                            //we're putting together a div that holds info on the
                            //account as well as an edit link if the user is an admin
                            acct
                        );
                    }
                    //if not, then they're not an admin so don't include the edit option
                    else {
                        /*acct = "<div class='accountRow' id='acct" + accountsArray[i].id + "'>" +
                            "<a class='nameTag' href='mailto:" + accountsArray[i].email + "'>" +
                            accountsArray[i].firstName + " " + accountsArray[i].lastName +
                            "</a></div><hr>"*/
                        showPanel('listPanel');
                        $("#listItemBox").empty();
                        LoadList()
                        LoadStores()
                    }

                }
            }
            //we're showing the account window, so let's track that...
            accountWindowShowing = true;
            //...because the ShowMenu function behaves differently depending on
            //if the account window is showing or not
            ShowMenu();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//this is just like loading accounts!
function LoadRequests() {
    var webMethod = "AccountServices.asmx/GetAccountRequests";
    $.ajax({
        type: "POST",
        url: webMethod,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d.length > 0) {
                $("#requestsBox").empty();
                admin = false;
                for (var i = 0; i < msg.d.length; i++) {
                    req = "<div class='accountRow' id='acctR" + msg.d[i].id + "'>" +
                        "<span class='nameTag'>" +
                        msg.d[i].firstName + " " + msg.d[i].lastName +
                        "</span> <span class='optionsTag'><a href='#' onclick='approveAccount(" + msg.d[i].id + ")'>yes</a> / " +
                        "<a href='#' onclick='rejectAccount(" + msg.d[i].id + ")'>no</a></span>" +
                        "<div style='font-size: smaller'>" + msg.d[i].email + "</div></div > <hr>";
                    $("#requestsBox").append(req);
                }
            }
            accountWindowShowing = false;
            ShowMenu();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//a simple ajax call that passes the id to be approved
function approveAccount(id) {
    var webMethod = "AccountServices.asmx/ActivateAccount";
    var parameters = "{\"id\":\"" + encodeURI(id) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('requestsPanel');
            LoadRequests();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//virtually identical with approve
function rejectAccount(id) {
    var webMethod = "AccountServices.asmx/RejectAccount";
    var parameters = "{\"id\":\"" + encodeURI(id) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('requestsPanel');
            LoadRequests();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//here's the variable to track if the account window is showing
var accountWindowShowing = false;
//and here's a function that adjusts the menu options if you're an admin or a user
//and if you're looking at accounts or requests
function ShowMenu() {

    $("#menu").css("visibility", "visible");
    if (admin) {
        if (accountWindowShowing) {
            $("#adminLink").text("requests");
        }
        else {
            $("#adminLink").text("accounts");
        }
    }
}

//just hides the menu
function HideMenu() {

    $("#menu").css("visibility", "hidden");
    $("#adminLink").text("");
}

//when an admin clicks either accounts or requests,
//they're shown the appropriate screen
function adminClick() {
    if (accountWindowShowing) {
        //show requests
        showPanel('requestsPanel');
        accountWindowShowing = false;
        LoadRequests()
        ShowMenu();
    }
    else {
        showPanel('accountsPanel');
        LoadAccounts();
        ShowMenu();
    }
}

//resets the new account inputs
function clearNewAccount() {
    $('#newLogonId').val("");
    $('#newLogonPassword').val("");
    $('#newLogonFName').val("");
    $('#newLogonLName').val("");
    $('#newLogonEmail').val("");
}

//resets the edit account inputs
function clearEditAccount() {
    $('#editLogonId').val("");
    $('#editLogonPassword').val("");
    $('#editLogonFName').val("");
    $('#editLogonLName').val("");
    $('#editLogonEmail').val("");
}

//resets the logon inputs
function clearLogon() {
    $('#logonId').val("");
    $('#logonPassword').val("");
}

//passes account info to the server, to create an account request
function CreateAccount(id, pass, fname, lname, email) {
    var webMethod = "AccountServices.asmx/RequestAccount";
    var parameters = "{\"uid\":\"" + encodeURI(id) + "\",\"pass\":\"" + encodeURI(pass) + "\",\"firstName\":\"" + encodeURI(fname) + "\",\"lastName\":\"" + encodeURI(lname) + "\",\"email\":\"" + encodeURI(email) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('logonPanel');
            alert("Account request pending approval...");
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//logs the user off both at the client and at the server
function LogOff() {

    var webMethod = "AccountServices.asmx/LogOff";
    $.ajax({
        type: "POST",
        url: webMethod,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d) {
                //we logged off, so go back to logon page,
                //stop checking messages
                //and clear the chat panel
                showPanel('logonPanel');
                HideMenu();
            }
            else {
            }
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//this function executes once jQuery has successfully loaded and is
//ready for business.  Usually, if we're wiring up event handlers via jQuery
//then this is where they go.
jQuery(function () {
    //when the app loads, show the logon panel to start with!
    showPanel('logonPanel');
});

//an ajax to kill an account
function DeactivateAccount() {
    var webMethod = "AccountServices.asmx/DeleteAccount";
    var parameters = "{\"id\":\"" + encodeURI(currentAccount.id) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('accountsPanel');
            LoadAccounts();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//hold on to the account being currently edited here
var currentAccount;
//load up an account for editing
function LoadAccount(id) {
    showPanel('editAccountPanel');
    currentAccount = null;
    //find the account with a matching id in our array
    for (var i = 0; i < accountsArray.length; i++) {
        if (accountsArray[i].id == id) {
            currentAccount = accountsArray[i]
        }
    }
    //set up our inputs
    if (currentAccount != null) {
        $('#editLogonId').val(currentAccount.userId);
        $('#editLogonPassword').val(currentAccount.password);
        $('#editLogonFName').val(currentAccount.firstName);
        $('#editLogonLName').val(currentAccount.lastName);
        $('#editLogonEmail').val(currentAccount.email);
    }
}

//ajax to send the edits of an account to the server
function EditAccount() {
    var webMethod = "AccountServices.asmx/UpdateAccount";
    var parameters = "{\"id\":\"" + encodeURI(currentAccount.id) + "\",\"uid\":\"" + encodeURI($('#editLogonId').val()) + "\",\"pass\":\"" + encodeURI($('#editLogonPassword').val()) + "\",\"firstName\":\"" + encodeURI($('#editLogonFName').val()) + "\",\"lastName\":\"" + encodeURI($('#editLogonLName').val()) + "\",\"email\":\"" + encodeURI($('#editLogonEmail').val()) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('accountsPanel');
            LoadAccounts();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}



// Functions for List below ----------------------------------------------------------------------------------------------------


var listsArray;

//this function grabs lists and loads our list window
function LoadList() {
    var webMethod = "ListServices.asmx/GetList";
    $.ajax({
        type: "POST",
        url: webMethod,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d.length > 0) {
                //let's put our accounts that we get from the
                //server into our accountsArray variable
                //so we can use them in other functions as well
                listsArray = msg.d;
                //this clears out the div that will hold our account info
                $("#listItemBox").empty();
                for (var i = 0; i < listsArray.length; i++) {
                    //we grab on to a specific html element in jQuery
                    //by using a  # followed by that element's id.
                    var acct;

                    acct = "<input type='checkbox' class='" + listsArray[i].checkedId + "' id='myCheck" + listsArray[i].id + "' onclick=" + "\"CrossOutItem(" + listsArray[i].id + ",'" + listsArray[i].checkedId + "')" + "\">" +
                        "<li class='accountRow' id=" + listsArray[i].id + " onclick='currentItem(" + listsArray[i].id + ")'>" +
                        listsArray[i].list + "</li>"

                    var acctChecked;
                    acctChecked = "<input type='checkbox' class='" + listsArray[i].checkedId + "' id='myCheck" + listsArray[i].id + "' onclick=" + "\"CrossOutItem(" + listsArray[i].id + ",'" + listsArray[i].checkedId + "')" + "\" checked>" +
                        "<li class='accountRow' id=" + listsArray[i].id + " onclick='currentItem(" + listsArray[i].id + ")'>" +
                        listsArray[i].list + "</li>"

                    if (listsArray[i].checkedId == "unchecked") {
                        $("#listItemBox").append(
                            //anything we throw at our panel in the form of text
                            //will be added to the contents of that panel.  Here
                            acct
                        );
                    } else {
                        $("#listItemBox").append(
                            //anything we throw at our panel in the form of text
                            //will be added to the contents of that panel.  Here
                            acctChecked
                        );
                    }

                }
            }
            //we're showing the account window, so let's track that...
            accountWindowShowing = true;
            //...because the ShowMenu function behaves differently depending on
            //if the account window is showing or not
            ShowMenu();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//passes item info to the server, to add item to list
function AddItem(item) {
    var webMethod = "ListServices.asmx/AddItemToList";
    var parameters = "{\"item\":\"" + encodeURI(item) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            alert("Item successfully added");
            LoadList();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

var currentItemId;
var currentItemUpdates;

// Saves selected item ID and outputs text content in txt input box.
function currentItem(id) {
    currentItemId = id;
    var itemText = document.getElementById(id).textContent;
    var inputText = document.getElementById("txt");
    inputText.value = itemText;
}

//ajax to send the edits of an item to the server
function EditListItem() {
    currentItemUpdates = document.getElementById("txt").value;
    var webMethod = "ListServices.asmx/UpdateList";
    var parameters = "{\"id\":\"" + encodeURI(currentItemId) + "\",\"list\":\"" + encodeURI(currentItemUpdates) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('listPanel');
            alert("Item successfully updated");
            LoadList();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//an ajax to delete a list
function DeleteItem() {
    var webMethod = "ListServices.asmx/DeleteListItem";
    var parameters = "{\"id\":\"" + encodeURI(currentItemId) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('listPanel');
            alert("Item successfully deleted from list");
            LoadList();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

var crossOutItemId;
var crossOutCheckedId;
// Saves selected item ID and outputs text content in txt input box.
function CrossOutItem(id, checkedId) {
    var className = "myCheck" + id.toString();
    console.log(className);
    var checkBox = document.getElementById(className);
    crossOutItemId = id;
    crossOutCheckedId = checkedId;
    if (checkBox.checked == true) {
        crossOutCheckedId = "checked";
    } else {
        crossOutCheckedId = "unchecked";
    }
    CrossOut();
}

//ajax to send the edits of an item to the server
function CrossOut() {
    var webMethod = "ListServices.asmx/UpdateCheckList";
    var parameters = "{\"id\":\"" + encodeURI(crossOutItemId) + "\",\"checkId\":\"" + encodeURI(crossOutCheckedId) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('listPanel');
            alert("Item successfully updated");
            LoadList();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

// ------------------------------------------------------------------------------ JS for store list
var storeArray;

//this function grabs lists and loads our list window
function LoadStores() {
    var webMethod = "StoreServices.asmx/GetStoreList";
    $.ajax({
        type: "POST",
        url: webMethod,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d.length > 0) {
                //let's put our accounts that we get from the
                //server into our accountsArray variable
                //so we can use them in other functions as well
                storeArray = msg.d;
                //this clears out the div that will hold our account info
                $("#storeListBox").empty();
                for (var i = 0; i < storeArray.length; i++) {
                    //we grab on to a specific html element in jQuery
                    //by using a  # followed by that element's id.
                    var acct;

                    acct = "<li class='accountRow' id='store" + storeArray[i].id + "' onclick='currentStore(" + storeArray[i].id + ")'>" +
                        storeArray[i].storeName + "</li>"

                    $("#storeListBox").append(
                        //anything we throw at our panel in the form of text
                        //will be added to the contents of that panel.  Here
                        acct
                    );
                }
            }
            //we're showing the account window, so let's track that...
            accountWindowShowing = true;
            //...because the ShowMenu function behaves differently depending on
            //if the account window is showing or not
            ShowMenu();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//passes item info to the server, to add item to list
function AddStore(store) {
    var webMethod = "StoreServices.asmx/AddStoreToList";
    var parameters = "{\"store\":\"" + encodeURI(store) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            alert("Store successfully added");
            LoadStores();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

var currentStoreId;
var currentStoreUpdates;

// Saves selected item ID and outputs text content in txt input box.
function currentStore(id) {
    currentStoreId = id;
    var storeText = document.getElementById("store" + id).textContent;
    var inputText = document.getElementById("storeTxt");
    inputText.value = storeText;
}

//ajax to send the edits of an item to the server
function EditStore() {
    currentStoreUpdates = document.getElementById("storeTxt").value;
    var webMethod = "StoreServices.asmx/UpdateStore";
    var parameters = "{\"id\":\"" + encodeURI(currentStoreId) + "\",\"store\":\"" + encodeURI(currentStoreUpdates) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('listPanel');
            alert("Store successfully updated");
            LoadStores();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//an ajax to delete a list
function DeleteStore() {
    var webMethod = "StoreServices.asmx/DeleteStore";
    var parameters = "{\"id\":\"" + encodeURI(currentStoreId) + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            showPanel('listPanel');
            alert("Store successfully deleted from list");
            LoadStores();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}
// -------------------------------------------------------------------------------------- add user email
function addUser() {

    dontHide();
    input = document.getElementById('AddUser').value;
    document.getElementById('AddUser').value = "";
    alert = document.getElementById('userAlert');

    alert.append("The user with the email " + input + " has been added to the list!!");

    setTimeout("doHide()", 5000);
}

function doHide() {
    document.getElementById("userAlert").style.display = "none";
}

function dontHide() {
    document.getElementById("userAlert").innerHTML = "";
    document.getElementById("userAlert").style.display = "block";
}