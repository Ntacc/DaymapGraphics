// From Daymap.


let getMenu = () => {
	let menu2 = new LoopMenu(document.querySelector('#mnu'), null);
	if(!menu2.MenuHtml) {
		return getMenu();
	} else {
		return menu2;
	}
}
let menu = getMenu(); 
menu.MenuHtml[272] = null;
menu.MenuHtml[1] = "<table class='lpMenu' cellspacing='0'><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Feed View</td><td class='lpMenuTd3' href=\"/daymap/student/dayplan.aspx\" menuId='2'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Timetable</td><td class='lpMenuTd3' href=\"/daymap/timetable/timetable.aspx\" menuId='3'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Homework</td><td class='lpMenuTd3' href=\"/daymap/student/homework.aspx\" menuId='36'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Summary</td><td class='lpMenuTd3' href=\"/daymap/student/studentreport.aspx\" menuId='56'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Portfolio</td><td class='lpMenuTd3' href=\"/daymap/student/portfolio.aspx\" menuId='175'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Mobile Daymap</td><td class='lpMenuTd3' href=\"/daymap/m/index.aspx\" menuId='141'>&nbsp;</td></tr></table>";
menu.MenuHtml[2] = null;
menu.MenuHtml[3] = null;
menu.MenuHtml[36] = null;
menu.MenuHtml[56] = null;
menu.MenuHtml[175] = null;
menu.MenuHtml[141] = null;
menu.MenuHtml[4] = "<table class='lpMenu' cellspacing='0'><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Diary</td><td class='lpMenuTd3' href=\"/daymap/timetable/diary.aspx\" menuId='46'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Class List</td><td class='lpMenuTd3' href=\"/daymap/student/classes.aspx\" menuId='47'>&nbsp;</td></tr></table>";
menu.MenuHtml[46] = null;
menu.MenuHtml[47] = null;
menu.MenuHtml[5] = "<table class='lpMenu' cellspacing='0'><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Task Finder</td><td class='lpMenuTd3' href=\"/daymap/student/assignments.aspx\" menuId='6'><img src='/DayMap/images/arrow_right.gif' align='right' border='0'></td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Results</td><td class='lpMenuTd3' href=\"/daymap/student/portfolio.aspx?tab=Assessment_Results\" menuId='274'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Schedule</td><td class='lpMenuTd3' href=\"/daymap/student/portfolio.aspx?tab=Assessment_Schedule\" menuId='275'>&nbsp;</td></tr></table>";
menu.MenuHtml[6] = "<table class='lpMenu' cellspacing='0'><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Current</td><td class='lpMenuTd3' href=\"/daymap/student/assignments.aspx?Status=1\" menuId='8'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>All For This Year</td><td class='lpMenuTd3' href=\"/daymap/student/assignments.aspx?Status=2\" menuId='9'>&nbsp;</td></tr><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>All</td><td class='lpMenuTd3' href=\"/daymap/student/assignments.aspx?Status=0\" menuId='41'>&nbsp;</td></tr></table>";
menu.MenuHtml[8] = null;
menu.MenuHtml[87] = "<table class='lpMenu' cellspacing='0'><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>My Messages</td><td class='lpMenuTd3' href=\"/daymap/coms/Messaging.aspx\" menuId='134'>&nbsp;</td></tr></table>";
menu.MenuHtml[134] = null;
menu.MenuHtml[67] = "<table class='lpMenu' cellspacing='0'><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>My Calendars</td><td class='lpMenuTd3' href=\"/daymap/calendar/MyCalendar.aspx\" menuId='196'>&nbsp;</td></tr></table>";
menu.MenuHtml[9] = null;
menu.MenuHtml[41] = null;
menu.MenuHtml[274] = null;
menu.MenuHtml[275] = null;
menu.MenuHtml[196] = null;
menu.MenuHtml[261] = null;
menu.MenuHtml[16] = "<table class='lpMenu' cellspacing='0'><tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2' onclick=\"document.querySelector('#toolbox').style.display = 'block'\">Daymap Graphics Command Center</td><td class='lpMenuTd3' menuId='60'>&nbsp;</td></tr></table>";
menu.MenuHtml[60] = null;