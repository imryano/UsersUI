function initLoginApp() {
	new Vue({
		el: 'loginApp',
		template: `
		<form class="go-top col-12 login">
			<div class="col-12 col-m-5 col-l-6 col-xl-7 loginSection">
				<div class="col-12 col-m-4">
					TEST
				</div>
			</div>
			<div class="col-12 col-m-7 col-l-6 col-xl-5">
				<div>
					<div class="col-12">
						<h3>Please log in to continue</h3>
					</div>
					<div class="col-12">
						<input id="username" name="username" type="text" v-model="username" required tab-index="1">
						<label for="username" class="placeholder-text">Username</label>
					</div>
					<div class="col-12">
						<input id="password" name="password" type="password" v-model="password" required  tab-index="2">
						<label for="password" class="placeholder-text">Password</label>
					</div>
					<div class="col-12">
						<input id="login" name="login" type="button" value="Log in" v-on:click="tryLogin" tab-index="3">
					</div>				
				</div>
			</div>
			<div class="row">
				<div class="push-1 col-10">
					{{error}}
				</div>
			</div>
			<div>
			{{username}} {{password}}
			</div>
		</form>`,

		data: {
			username: '',
			password: '',
			error: ''
		},

		methods: {
			tryLogin: function(event){
				(event.target).style.display = "none";
				var dt = {"username": this.username, "password": this.password};

				axios.post('http://127.0.0.1:8080/tryLogin',dt, { withCredentials: true, credentials: 'same-origin' })
				.then(function(response) {
					if (response.data.redirectURL != ''){
						window.location = response.data.redirectURL;
					}
					this.error = response.data.error;
					if (this.error == ''){
						this.error = "Successfully Logged In";
					}
				})
				.catch(function(e){
					this.error = e;
				});
				(event.target).style.display = "";
				return false;
			}
		}
	});
};