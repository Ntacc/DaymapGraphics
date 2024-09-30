let menu = new LoopMenu(document.querySelector('#mnu'), null);

// Day Plan
menu.MenuHtml[1] = `<table class='lpMenu' cellspacing='0'>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Feed View</td><td class='lpMenuTd3' href="/daymap/student/dayplan.aspx">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Timetable</td><td class='lpMenuTd3' href="/daymap/timetable/timetable.aspx">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Homework</td><td class='lpMenuTd3' href="/daymap/student/homework.aspx">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Summary</td><td class='lpMenuTd3' href="/daymap/student/studentreport.aspx">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Portfolio</td><td class='lpMenuTd3' href="/daymap/student/portfolio.aspx">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Mobile Daymap</td><td class='lpMenuTd3' href="/daymap/m/index.aspx">&nbsp;</td></tr>
</table>`;

// Classes
menu.MenuHtml[2] = `<table class='lpMenu' cellspacing='0'>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Diary</td><td class='lpMenuTd3' href="/daymap/timetable/diary.aspx">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Class List</td><td class='lpMenuTd3' href="/daymap/student/classes.aspx">&nbsp;</td></tr>
</table>`;

// Assessment
menu.MenuHtml[3] = `<table class='lpMenu' cellspacing='0'>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Task Finder</td><td class='lpMenuTd3' href="/daymap/student/assignments.aspx" menuid='7'><img src='/DayMap/images/arrow_right.gif' align='right' border='0'></td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Results</td><td class='lpMenuTd3' href="/daymap/student/portfolio.aspx?tab=Assessment_Results">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Schedule</td><td class='lpMenuTd3' href="/daymap/student/portfolio.aspx?tab=Assessment_Schedule">&nbsp;</td></tr>
</table>`;

// Communications
menu.MenuHtml[4] = `<table class='lpMenu' cellspacing='0'>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>My Messages</td><td class='lpMenuTd3' href="/daymap/coms/Messaging.aspx">&nbsp;</td></tr>
</table>`;

// Calendars
menu.MenuHtml[5] = `<table class='lpMenu' cellspacing='0'>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>My Calendars</td><td class='lpMenuTd3' href="/daymap/calendar/MyCalendar.aspx">&nbsp;</td></tr>
</table>`;

/*// Daymap Graphics! (previously Tools)
menu.MenuHtml[6] = `<table class='lpMenu' cellspacing='0'>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2' onclick="document.querySelector('#toolbox').style.display = 'block'">Toolbox</td><td class='lpMenuTd3'>&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2' onclick="document.querySelector('#bugBook').style.display = 'block'">Bug Book</td><td class='lpMenuTd3'>&nbsp;</td></tr>
</table>`;*/

// Task Finder (submenu of Assessment)
menu.MenuHtml[7] = `<table class='lpMenu' cellspacing='0'>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>Current</td><td class='lpMenuTd3' href="/daymap/student/assignments.aspx?Status=1">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>All For This Year</td><td class='lpMenuTd3' href="/daymap/student/assignments.aspx?Status=2">&nbsp;</td></tr>
	<tr><td class='lpMenuTd1'><div></div></td><td class='lpMenuTd2'>All</td><td class='lpMenuTd3' href="/daymap/student/assignments.aspx?Status=0">&nbsp;</td></tr>
</table>`;