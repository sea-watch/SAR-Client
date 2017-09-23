SAR-Client Onefleet
===================

# Introduction

## Supported Devices / Browser
App supports operating systems Windows, OSX, Linux, Android and iOS.
App is running with different screen breakpoints for Desktop, Tablet and Mobile Devices.

## Installing the App
- Microsoft Windows
- Apple
- Linux

## Updating with new releases

## Starting the App
System Settings windows opens automatically. 
The database URL needs to be added.
Press "Close" button and proceed with the login window with username / password.
If no login window is shown, check if you are are still logged in. 
Logout and login again -
Open the dropdown flyout in the right corner of the navigation bar. Select the Logout link.
App restarts and try again to login.


#  Navigation
## Header
You have a navigation bar to navigate to all cases, see the map and create a new case.
At the right end of the navigation bar you can open with the arrow symbol a flyout to goto the app settings or to logout

## Footer
## Filter on Left-Hand-Side
- Vehicles
- Case Status

# Cases
## Fields for a case
**Boattype**
Select the boattype if you know it.
- Rubber
- Wood
- Steal or Other

**Status**
- Critical
- Possible 
- Attended
- Rescued
- Closed

**People in water ?** 
Select the checkbox if ppl in water (Yes), else deselect the checkbox (No).

**Engine is working ?**
Select if the motor is working (Yes), else deselect the checkbox (No).

**On-Scene-Coordinator (OSC)**
Person is responsible of the coordination of that case between the different acteurs.

**Position**
If you have the coordinates in 
- Grad, Minutes,Seconds (GMS): Select Button "GMS" for the coordinate format and input the Grade, Minutes and Seconds for the Latidude and Longitude into the fields
- Decimal Degrees (DD): Select Button DD for the coordinate format and input the Latidude and Longitude in decimal format into the fields

**GPS Position** 
Button to create with your actual positon new case. To be used, if you are on SAR vessel and in the middle of an SAR Operation to document quick the cases.

**People**
**How many people ?** Input number of all ppl on the boat.
**Woman ?** Input number of woman on the boat.
**Children ?** Input number of children on the boat.
**Disabled ?** Input number of disabled ppl on the boat.

**Other boat/s involved ?** Input information if other acteurs involved in that case e.g. mrcc, sea-eye2, alarmphone

**Additional information** Input more infos e.g. contact to the boat, 


## Create Case 
![New Case][NewCase]
Goto Navigation Bar "+ Case" and add the corresponding information about a case into the fields.


## Edit Case
Goto Navigation Bar "Cases" you get a list of cases. 
Each case entry has a Subject Bar with timestamp, unique identifier, who and when is the case created.


## View Case
Goto Navigation Bar "Cases" you get a list with all the cases entered into the system.
On the left-hand-side navigation you can filter after the status of a case, so that you easily find a case e.g. in status critical or to get a quick overview.

# Map

- Filter for vehicles
- Zoom in/out
- Click on a boat icon then you get the excact position an name of the boat

# Chat
- Read / Write / Scrolling

[NewCase]: https://github.com/sea-watch/SAR-Client/tree/master/docu/newcase.jpg "Creating New Case"
