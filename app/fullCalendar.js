import calendarApp from 'app/calendar.js';

function initFullCalendarApp() {
	new Vue({
		el: 'fullCalendarApp',
		template: `
			<calendarApp
				:show-date="showDate"
				@clickDay="onClickDay"
				@clickEvent="onClickEvent"
				@setShowDate="setShowDate"
				enable-drag-drop="true"
				@dropEventOnDate="onDrop"
				:events="events">
			</calendarApp>`,
		components: {
			calendarApp,
		},
		data: {
			/* Always start the demo on May 2017 */
			showDate: new Date(2017, 4, 1),
			message: 'Click a date or event...',
			events: [
				{ id: 'e1', startDate: new Date(2017, 4, 15), endDate: new Date(2017, 4, 15), title: 'Single-day event with a long title' },
				{ id: 'e2', startDate: new Date(2017, 4, 7), endDate: new Date(2017, 4, 10), title: 'Multi-day event with a long title' },
				{ id: 'e3', startDate: new Date(2017, 4, 20), endDate: new Date(2017, 4, 20), title: 'My Birthday!', classes: 'birthday', url: 'https://en.wikipedia.org/wiki/Birthday' },
				{ id: 'e4', startDate: new Date(2017, 4, 5), endDate: new Date(2017, 4, 12), title: 'Multi-day event', classes: 'purple' },
				{ id: 'e5', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 1' },
				{ id: 'e6', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 2', classes: 'orange' },
				{ id: 'e7', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 3' },
				{ id: 'e8', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 4', classes: 'orange' },
				{ id: 'e9', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 5' },
				{ id: 'e10', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 6', classes: 'orange' },
				{ id: 'e11', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 7' },
				]
		},
		methods: {
			onClickDay(d) { this.message = `You clicked: ${d}`; },
			onClickEvent(e) { this.message = `You clicked: ${e.title}`; },
			setShowDate(d) {
				this.message = `Changing calendar view to ${d}`;
				this.showDate = d;
			},
			onDrop(event, date) {
				this.message = `You dropped ${event} on ${date.toISOString()}`;
				const e = this.events.filter(ev => ev.id === event)[0];
				const eLength = Calendar.methods.dayDiff(e.startDate, e.endDate);
				e.startDate = date;
				e.endDate = Calendar.methods.addDays(date, eLength);
			}
		}
	})
}
