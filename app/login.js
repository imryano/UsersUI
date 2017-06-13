function initLoginApp() {
	new Vue({
		el: 'loginApp',
		template: `
		<form class="go-top col-12 login">
			<div class="col-12 col-m-5 push-xl-2 col-xl-3 loginSection">
				<div class="col-0 col-m-12"></div>
				<div class="col-0 col-m-12"></div>
				<div class="col-0 col-m-12"></div>
				<div class="col-0 col-m-12"></div>
				<div class="col-12 col-m-12">
					<h1>Booker.com.au</h1> 	
				</div>
				<div class="col-0 col-m-12"></div>
				<div class="col-0 col-m-12"></div>
				<div class="col-0 col-m-12"></div>
				<div class="col-0 col-m-12"></div>
			</div>
			<div class="col-12 col-m-7 col-xl-5 loginForm">
				<div class="col-12 center">
					<h3>Please log in to continue</h3>
				</div>
				<div class="col-12">
					<div class="loginWrapper col-12">
						<div class="col-12">
							<input id="username" placeholder="Username" name="username" type="text" v-model="username" required tab-index="1">
						</div>
						<hr />
						<div class="col-12">
							<input id="password" placeholder="Password" name="password" type="password" v-model="password" required v-on:keyup="checkEnter"  tab-index="2">
						</div>
					</div>	
				</div>				
				<div class="col-12">
					<input id="login" name="login" type="button" value="Log in" v-on:click="tryLogin" tab-index="3">			
				</div>
				<div class="row col-12" v-if="error != '' || success != ''">
					<div class="col-12 errorMessage" v-if="error != ''">
						{{error}}
					</div>
					<div class="col-12 successMessage"  v-if="success != ''">
						{{success}}
					</div>
				</div>			
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
					vc.error = "There was a problem connecting to the authentication service. Please try again shortly.";
				});
				(event.target).style.display = "";
				return false;
			}
		}
	});
};