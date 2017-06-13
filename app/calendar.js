function initCalendarApp() {
	new Vue({
		el: 'calendarApp',
		template: `
		<div class="calendar col-12 col-m-9 col-l-7 col-xl-6"
			:class="[
					'locale-' + languageCode,
					'locale-' + locale,
					'y' + showDate.getFullYear(),
					'm' + paddedMonth(showDate),
					{
						past: beginningOfMonth(today) < showDate,
						future: beginningOfMonth(today) > showDate
					}
				]">		
			<div class="header row-7">
				<div class="previousYear col-1"><button @click="onClickPreviousYear" :disabled="disablePast && (today > endOfPreviousYear(showDate))"></button></div>
				<div class="previousMonth col-1"><button @click="onClickPreviousMonth" :disabled="disablePast && (today > endOfPreviousMonth(showDate))"></button></div>
				<div class="thisMonth col-3">
					<div class="monthLabel">
						<span class="monthName">{{monthName(showDate)}}</span>
						<span class="yearNumber">{{showDate.getFullYear()}}</span>
					</div>
					<div v-if="!isSameMonth(today, showDate)" class="currentMonth"><button @click="onClickCurrentMonth"></button></div>
				</div>
				<div class="nextMonth col-1"><button @click="onClickNextMonth" :disabled="disableFuture && (today < beginningOfNextMonth(showDate))"></button></div>
				<div class="nextYear col-1"><button @click="onClickNextYear" :disabled="disableFuture && (today < beginningOfNextYear(showDate))"></button></div>
			</div>
			<div class="dayList row-7">
				<div class="col-1" v-for="(w, index) in weekdayNames" :class="'dow'+index">{{w}}</div>
			</div>
			<div class="month row-7">
				<div v-for="(weekStart, weekIndex) in weeks" class="week" :class="['week' + (weekIndex+1), 'ws' + isoYearMonthDay(weekStart)]">
					<div v-for="day in daysOfWeek(weekStart)" class="day col-1" 
						@drop.prevent="onDrop(day, $event)"
						@dragover.prevent="onDragOver(day, $event)"
						@dragenter.prevent="onDragEnter(day, $event)"
						@dragleave.prevent="onDragLeave(day, $event)"
						:class="[
							'dow' + day.getDay(),
							'd' + isoYearMonthDay(day),
							'd' + isoMonthDay(day),
							'd' + paddedDay(day),
							'instance' + instanceOfMonth(day),
							{
								outsideOfMonth : day.getMonth() != showDate.getMonth(),
								today : isSameDate(day, today),
								past : isInPast(day),
								future : isInFuture(day),
								last: day.getMonth() !== addDays(day, 1).getMonth(),
								lastInstance: lastInstanceOfMonth(day),
							}
						]" @click="onClickDay(day)">
						<div class="content">
							<div class="date">{{day.getDate()}}</div>
						</div>
					</div>
					<div v-for="e in getWeekEvents(weekStart)"
						class="event"
						:draggable="enableDragDrop"
						@dragstart="onDragStart(e, $event)"
						@click.stop="onClickEvent(e)"
						:class="e.classes"
						:title="e.details.title"
						v-html="e.details.title"></div>
					</div>
			</div>
		</div>`,
		data: {
			
		},
		props: {
			events: {
				type: Array,
				default() { return []; },
			},
			showDate: {
				type: Date,
				default() {
					const d = new Date();
					d.setHours(0, 0, 0, 0);
					return d;
				},
			},
			monthNameFormat: {
				type: String,
				default() { return 'long'; },
			},
			weekdayNameFormat: {
				type: String,
				default() { return 'short'; },
			},
			locale: {
				type: String,
				default() {
					return (
						(navigator.languages && navigator.languages.length) ?
							navigator.languages[0]
							: navigator.language || navigator.browserLanguage
					).toLowerCase();
				},
			},
			disablePast: {
				type: Boolean,
				default() { return false; },
			},
			disableFuture: {
				type: Boolean,
				default() { return false; },
			},
			enableDragDrop: {
				default() { return false; },
			},
		},
		computed: {
			today() {
				const d = new Date();
				d.setHours(0, 0, 0, 0);
				return d;
			},
			languageCode() {
				return this.locale.substring(0, 2);
			},
			weeks() {
				// Returns an array of object representing the date of the beginning of each week
				// included in the view (which, by default, consists of an entire month).
				const firstDate = this.beginningOfCalendar(this.showDate);
				const lastDate = this.endOfCalendar(this.showDate);
				const numWeeks = Math.floor(this.dayDiff(firstDate, lastDate) / 7);
				const result = [];
				for (let x = 0; x < numWeeks; x++) {
					result.push(this.addDays(firstDate, x * 7));
				}
				return result;
			},
			weekdayNames() {
				if (typeof Intl === 'undefined') {
					return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
				}
				const formatter = new Intl.DateTimeFormat(this.locale, { weekday: this.weekdayNameFormat });
				const names = [];
				for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
					// 2017 starts on a Sunday, so use it to capture the locale's weekday names
					const sampleDate = new Date(2017, 0, dayIndex + 1, 0, 0, 0);
					names[dayIndex] = formatter.format(sampleDate);
				}
				return names;
			},
			allowLastMonthClick() {
				if (!this.disablePast) return true;
				const endOfLastMonth = this.addDays(this.beginningOfMonth(this.showDate), -1);
				return endOfLastMonth >= this.today;
			},
			allowNextMonthClick() {
				if (!this.disableFuture) return true;
				const beginningOfNextMonth = this.addDays(this.endOfMonth(this.showDate), 1);
				return beginningOfNextMonth <= this.today;
			},
		},
		methods: {
			addDays(d, days) {
				const d2 = new Date(d);
				d2.setDate(d.getDate() + days);
				return d2;
			},
			isSameDate(d1, d2) {
				// http://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
				return d1.getTime() === d2.getTime();
			},
			isSameMonth(d1, d2) {
				return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
			},
			daysOfWeek(weekStart) {
				const result = [];
				for (let x = 0; x < 7; x++) result.push(this.addDays(weekStart, x));
				return result;
			},
			isInFuture(d) { return d > this.today; },
			isInPast(d) { return d < this.today; },
			instanceOfMonth: d => Math.ceil(d.getDate() / 7),
			isoYearMonthDay: d => d.toISOString().slice(0, 10),
			isoMonthDay: d => d.toISOString().slice(5, 10),
			isoYearMonth: d => d.toISOString().slice(0, 7),
			paddedMonth: d => ('0' + String(d.getMonth() + 1)).slice(-2),
			paddedDay: d => ('0' + String(d.getDate() + 1)).slice(-2),
			beginningOfMonth: d => new Date(d.getFullYear(), d.getMonth(), 1),
			endOfMonth: d => new Date(d.getFullYear(), d.getMonth() + 1, 0),
			endOfPreviousMonth: d => new Date(d.getFullYear(), d.getMonth(), 0),
			aYearAgo: d => new Date(d.getFullYear() - 1, d.getMonth(), 1),
			aYearFrom: d => new Date(d.getFullYear() + 1, d.getMonth(), 1),
			beginningOfPreviousMonth: d => new Date(d.getFullYear(), d.getMonth() - 1, 1),
			beginningOfNextMonth: d => new Date(d.getFullYear(), d.getMonth() + 1, 1),
			lastInstanceOfMonth(d) { return d.getMonth() !== this.addDays(d, 7).getMonth(); },
			beginningOfWeek(d) { return this.addDays(d, 0 - d.getDay()); },
			endOfWeek(d) { return this.addDays(d, 7 - d.getDay()); },
			beginningOfCalendar(d) { return this.beginningOfWeek(this.beginningOfMonth(d)); },
			endOfCalendar(d) { return this.endOfWeek(this.endOfMonth(d)); },
			// Number of days between two dates (times must be 0)
			dayDiff(d1, d2) { return (d2 - d1) / 86400000; },
			// Name of the given month (only used once)
			monthName(d) {
				// Use the user's locale if possible to obtain the name of the month
				if (typeof Intl === 'undefined') {
					return ['Jan', 'Feb', 'Mar', 'Apr', 'May',
						'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
				}
				const formatter = new Intl.DateTimeFormat(this.locale, { month: this.monthNameFormat });
				return formatter.format(d);
			},
			onClickDay(day) {
				if (this.disablePast && this.isInPast(day)) return;
				this.$emit('clickDay', day);
			},
			onClickEvent(e, day) {
				this.$emit('clickEvent', e.details, day);
			},
			onClickPreviousYear() { this.$emit('setShowDate', this.aYearAgo(this.showDate)); },
			onClickPreviousMonth() { this.$emit('setShowDate', this.beginningOfPreviousMonth(this.showDate)); },
			onClickNextMonth() { this.$emit('setShowDate', this.beginningOfNextMonth(this.showDate)); },
			onClickNextYear() { this.$emit('setShowDate', this.aYearFrom(this.showDate)); },
			onClickCurrentMonth() { this.$emit('setShowDate', this.beginningOfMonth(this.today)); },
			findAndSortEventsInWeek(weekStart) {
				// Return a list of events that CONTAIN the week starting on a day.
				// Sorted so the events that start earlier are always shown first.
				const events = this.events.filter(event =>
					event.startDate < this.addDays(weekStart, 7)
					&& event.endDate >= weekStart
				, this).sort((a, b) => {
					if (a.startDate < b.startDate) return -1;
					if (b.startDate < a.startDate) return 1;
					if (a.endDate > b.endDate) return -1;
					if (b.endDate > a.endDate) return 1;
					return a.id < b.id ? -1 : 1;
				});
				return events;
			},
			getWeekEvents(weekStart) {
				// Return a list of events that CONTAIN the week starting on a day.
				// Sorted so the events that start earlier are always shown first.
				const events = this.findAndSortEventsInWeek(weekStart);
				const results = [];
				const slots = [[], [], [], [], [], [], [], [], [], []];
				for (let i = 0; i < events.length; i++) {
					const e = events[i];
					const ep = { details: e, slot: 0 };
					const continued = e.startDate < weekStart;
					const startOffset = continued ? 0 : this.dayDiff(weekStart, e.startDate);
					const toBeContinued = this.dayDiff(weekStart, e.endDate) > 7;
					const span = Math.min(
						7 - startOffset,
						this.dayDiff(this.addDays(weekStart, startOffset), e.endDate) + 1);
					for (let d = 0; d < 7; d++) {
						if (d === startOffset) {
							for (let s = 0; s < 10; s++) {
								if (!slots[d][s]) {
									ep.slot = s;
									slots[d][s] = true;
									break;
								}
							}
						} else if (d < startOffset + span) {
							slots[d][ep.slot] = true;
						}
					}
					ep.classes = [
						`offset${startOffset}`,
						`span${span}`,
						`slot${ep.slot + 1}`,
						{
							continued,
							toBeContinued,
							hasUrl: e.url,
						},
					];
					if (e.classes) ep.classes = ep.classes.concat(e.classes);
					results.push(ep);
				}
				return results;
			},
			onDragStart(calendarEvent, windowEvent) {
				if (!this.enableDragDrop) return false;
				// Reason for using "Text":
				// http://stackoverflow.com/questions/26213011/html5-dragdrop-issue-in-internet-explorer-datatransfer-property-access-not-pos
				windowEvent.dataTransfer.setData('Text', calendarEvent.details.id);
				this.$emit('dragEventStart', calendarEvent.details.id, calendarEvent);
				return true;
			},
			handleEvent(windowEvent, bubbleEventName, bubbleParam) {
				if (!this.enableDragDrop) return false;
				const calendarEventId = windowEvent.dataTransfer.getData('Text');
				this.$emit(bubbleEventName, calendarEventId, bubbleParam);
				return true;
			},
			onDragOver(day, windowEvent) {
				this.handleEvent(windowEvent, 'dragEventDragOverDate', day);
			},
			onDragEnter(day, windowEvent) {
				if (!this.handleEvent(windowEvent, 'dragEventEnterDate', day)) return;
				windowEvent.target.classList.add('draghover');
			},
			onDragLeave(day, windowEvent) {
				if (!this.handleEvent(windowEvent, 'dragEventLeaveDate', day)) return;
				windowEvent.target.classList.remove('draghover');
			},
			onDrop(day, windowEvent) {
				if (!this.handleEvent(windowEvent, 'dropEventOnDate', day)) return;
				windowEvent.target.classList.remove('draghover');
			},
		}
	});
};