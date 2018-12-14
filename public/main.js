var app = new Vue({
	el: "#app",
	data: {
		games: [],
		teams: [],
		maps: [],
		isActive: "hide",
		selectedTeam: "All",
		selectedLocation: "All",
		input: {
			date: ''
		},
		inputErrors: [],
		seen: false,
		isHidden: false,
		conversations: {},
		currentUser: '',
		loggedIn: '',
	},
	created: function () {
		this.getData("https://api.myjson.com/bins/73j12");
		firebase.auth().onAuthStateChanged(function (user) {
			if (user != null) {
				this.loggedIn = true;
				app.getPosts();
			} else {
				this.loggedIn = false;
			}
		});
	},
	methods: {
		getData: function (url) {
			fetch(url, {
					method: "GET"
				})
				.then(function (response) {
					return response.json()
				})
				.then(function (json) {
					app.games = json.games;
					app.teams = json.teams;
					app.maps = json.maps;
					app.loader();
					app.isHidden = true;
				})
				.catch(function (error) {
					console.log(error)
				});
		},
		toggleClass: function (value) {
			if (this.isActive != value) {
				this.isActive = value;
			} else {
				this.isActive = "hide";
			}
		},
		refreshCalendar: function () {
			type: 'date',
			$('#date').calendar('set date', this.input.date)
		},
		topFunction: function () {
			document.documentElement.scrollTop = 0;
			document.body.scrollTop = 0;
		},

		show: function (shown, hidden) {
			document.getElementById(shown).style.display = 'block';
			document.getElementById(hidden).style.display = 'none';
			return false;
		},
		loader: function () {
			document.getElementById("loaderWrap").style.display = "none"
		},
		login: function () {
			var provider = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithPopup(provider).then(function () {
				app.getPosts();
			})
		},
		logout: function () {
			firebase.auth().signOut();
			app.loggedIn = false;
		},
		writeNewPost: function (chat1) {

			var text = document.getElementById("textInput").value;
			var name = firebase.auth().currentUser.displayName;
			var img = firebase.auth().currentUser.photoURL;
			var mail = firebase.auth().currentUser.email;
			var date = new Date();
			var timetoString = String(date);
			var sliceTime = timetoString.slice(0, 21);

			var post = {
				name: name,
				body: text,
				image: img,
				email: mail,
				creationTime: sliceTime
			};

			var newPostKey = firebase.database().ref().child('chat1').push().key;
			var updates = {};
			updates[newPostKey] = post;
			$("#textInput").val("");
			return firebase.database().ref('chat1').update(updates);
		},
		getPosts: function () {
			app.loggedIn = true;
			app.currentUser = firebase.auth().currentUser.email;
			firebase.database().ref('chat1').on('value', function (data) {
				app.conversations = data.val();
				$(".textArea").animate({
					scrollTop: $(".textArea").prop("scrollHeight")
				}, 700);
			})
		},
		
		clearDate: function () {
			document.getElementById('cal').value = '';
			app.input.date = '';
		}
	},
	mounted: function () {
		$('#date').calendar({
			type: 'date',
			monthFirst: false,
			formatter: {
				date: function (date, settings) {
					if (!date) return '';
					var day = date.getDate() + '';
					if (day.length < 2) {
						day = '0' + day;
					}
					var month = (date.getMonth() + 1) + '';
					if (month.length < 2) {
						month = '0' + month;
					}
					var year = date.getFullYear();
					return day + '-' + month + '-' + year;
				}
			},
			onChange: function (date, text, mode) {
				app.input.date = text;
			}
		});
	},
	computed: {
		filterGames: function () {
			var app = this;
			var tm = app.selectedTeam;
			var loc = app.selectedLocation;
			var dt = app.input.date;

			if (tm == "All" && loc == "All" && dt == '') {
				app.seen = false;
				return app.games;
			} else {
				return app.games.filter(function (game) {
					return (loc == "All" || loc.location == game.location) && (tm == "All" || tm.name == game.host || tm.name == game.guest) && (dt == '' || dt == game.date)
				});
			}
		}
	}
});



window.addEventListener("scroll", function () {
	myFunction();
}, false);

function myFunction() {
	var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
	var fixed = document.getElementById("fixedBar");
	var topBtn = document.getElementById("topBtn");
	var section = document.getElementById("section");
	var ctWrap = document.getElementById("contentWrap");

	if (winScroll >= 60) {
		fixed.classList.add("on");
		topBtn.style.display = "block";
		ctWrap.classList.add("on");
	} else {
		fixed.classList.remove("on");
		topBtn.style.display = "none";
		ctWrap.classList.remove("on");
	}
}
