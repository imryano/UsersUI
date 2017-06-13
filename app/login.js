function initLoginApp() {
	new Vue({
		el: 'loginApp',
		template: `
		<form class="go-top col-12 login">
			<div class="col-12 col-m-5 col-l-6 push-xl-2 col-xl-3 loginSection">
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
						<input id="password" name="password" type="password" v-model="password" required v-on:keyup="checkEnter"  tab-index="2">
						<label for="password" class="placeholder-text">Password</label>
					</div>
					<div class="col-12">
						<input id="login" name="login" type="button" value="Log in" v-on:click="tryLogin" tab-index="3">
					</div>				
				</div>
				<div class="row">
					<div class="col-12 errorMessage" v-if="error != ''">
						{{error}}
					</div>
					<div class="col-12 successMessage"  v-if="success != ''">
						{{success}}
					</div>
				</div>
				<!--<div class="row">
					<div class="col-5">
						{{username}}
					</div>
					<div class="push-1 col-5">
						{{password}}
					</div>
				</div>-->
			</div>
		</form>`,

		data: {
			username: '',
			password: '',
			error: '',
			success: ''
		},

		methods: {
			checkEnter: function(event){
				if (event.key == "Enter"){
					document.getElementById('login').click();
					return false;
				}
			},
			tryLogin: function(event){
				(event.target).style.display = "none";
				var dt = {"username": this.username, "password": this.password};
				var vc = this;
				this.success = '';
				this.error = '';

				axios.post('http://127.0.0.1:8080/tryLogin',dt, { withCredentials: true, credentials: 'same-origin' })
				.then(function(response) {
					if (response.data.redirectURL != ''){
						window.location = response.data.redirectURL;
					}
					vc.error = response.data.error;

					if (vc.error == ''){
						vc.success = "Successfully Logged In";
					}
				})
				.catch(function(e){
					vc.error = e;
				});
				(event.target).style.display = "";
				return false;
			}
		}
	});
};