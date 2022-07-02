
(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Fix: Flexbox min-height bug on IE.
		if (browser.name == 'ie') {

			var flexboxFixTimeoutId;

			$window.on('resize.flexbox-fix', function() {

				clearTimeout(flexboxFixTimeoutId);

				flexboxFixTimeoutId = setTimeout(function() {

					if ($wrapper.prop('scrollHeight') > $window.height())
						$wrapper.css('height', 'auto');
					else
						$wrapper.css('height', '100vh');

				}, 250);

			}).triggerHandler('resize.flexbox-fix');

		}

	// Nav.
		var $nav = $header.children('nav'),
			$nav_li = $nav.find('li');

		// Add "middle" alignment classes if we're dealing with an even number of items.
			if ($nav_li.length % 2 == 0) {

				$nav.addClass('use-middle');
				$nav_li.eq( ($nav_li.length / 2) ).addClass('is-middle');

			}

	// Main.
		var	delay = 325,
			locked = false;

		// Methods.
			$main._show = function(id, initial) {

				var $article = $main_articles.filter('#' + id);

				// No such article? Bail.
					if ($article.length == 0)
						return;

				// Handle lock.

					// Already locked? Speed through "show" steps w/o delays.
						if (locked || (typeof initial != 'undefined' && initial === true)) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Mark as visible.
								$body.addClass('is-article-visible');

							// Deactivate all articles (just in case one's already active).
								$main_articles.removeClass('active');

							// Hide header, footer.
								$header.hide();
								$footer.hide();

							// Show main, article.
								$main.show();
								$article.show();

							// Activate article.
								$article.addClass('active');

							// Unlock.
								locked = false;

							// Unmark as switching.
								setTimeout(function() {
									$body.removeClass('is-switching');
								}, (initial ? 1000 : 0));

							return;

						}

					// Lock.
						locked = true;

				// Article already visible? Just swap articles.
					if ($body.hasClass('is-article-visible')) {

						// Deactivate current article.
							var $currentArticle = $main_articles.filter('.active');

							$currentArticle.removeClass('active');

						// Show article.
							setTimeout(function() {

								// Hide current article.
									$currentArticle.hide();

								// Show article.
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

				// Otherwise, handle as normal.
					else {

						// Mark as visible.
							$body
								.addClass('is-article-visible');

						// Show article.
							setTimeout(function() {

								// Hide header, footer.
									$header.hide();
									$footer.hide();

								// Show main, article.
									$main.show();
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

			};

			$main._hide = function(addState) {

				var $article = $main_articles.filter('.active');

				// Article not visible? Bail.
					if (!$body.hasClass('is-article-visible'))
						return;

				// Add state?
					if (typeof addState != 'undefined'
					&&	addState === true)
						history.pushState(null, null, '#');

				// Handle lock.

					// Already locked? Speed through "hide" steps w/o delays.
						if (locked) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Deactivate article.
								$article.removeClass('active');

							// Hide article, main.
								$article.hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								$body.removeClass('is-article-visible');

							// Unlock.
								locked = false;

							// Unmark as switching.
								$body.removeClass('is-switching');

							// Window stuff.
								$window
									.scrollTop(0)
									.triggerHandler('resize.flexbox-fix');

							return;

						}

					// Lock.
						locked = true;

				// Deactivate article.
					$article.removeClass('active');

				// Hide article.
					setTimeout(function() {

						// Hide article, main.
							$article.hide();
							$main.hide();

						// Show footer, header.
							$footer.show();
							$header.show();

						// Unmark as visible.
							setTimeout(function() {

								$body.removeClass('is-article-visible');

								// Window stuff.
									$window
										.scrollTop(0)
										.triggerHandler('resize.flexbox-fix');

								// Unlock.
									setTimeout(function() {
										locked = false;
									}, delay);

							}, 25);

					}, delay);


			};

		// Articles.
			$main_articles.each(function() {

				var $this = $(this);

				// Close.
					$('<div class="close">Close</div>')
						.appendTo($this)
						.on('click', function() {
							location.hash = '';
						});

				// Prevent clicks from inside article from bubbling.
					$this.on('click', function(event) {
						event.stopPropagation();
					});

			});

		// Events.
			$body.on('click', function(event) {

				// Article visible? Hide.
					if ($body.hasClass('is-article-visible'))
						$main._hide(true);

			});

			$window.on('keyup', function(event) {

				switch (event.keyCode) {

					case 27:

						// Article visible? Hide.
							if ($body.hasClass('is-article-visible'))
								$main._hide(true);

						break;

					default:
						break;

				}

			});

			$window.on('hashchange', function(event) {

				// Empty hash?
					if (location.hash == ''
					||	location.hash == '#') {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Hide.
							$main._hide();

					}

				// Otherwise, check for a matching article.
					else if ($main_articles.filter(location.hash).length > 0) {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Show article.
							$main._show(location.hash.substr(1));

					}

			});

		// Scroll restoration.
		// This prevents the page from scrolling back to the top on a hashchange.
			if ('scrollRestoration' in history)
				history.scrollRestoration = 'manual';
			else {

				var	oldScrollPos = 0,
					scrollPos = 0,
					$htmlbody = $('html,body');

				$window
					.on('scroll', function() {

						oldScrollPos = scrollPos;
						scrollPos = $htmlbody.scrollTop();

					})
					.on('hashchange', function() {
						$window.scrollTop(oldScrollPos);
					});

			}

		// Initialize.

			// Hide main, articles.
				$main.hide();
				$main_articles.hide();

			// Initial article.
				if (location.hash != ''
				&&	location.hash != '#')
					$window.on('load', function() {
						$main._show(location.hash.substr(1), true);
					});

})(jQuery);

// NASA Photo Browser Code

document.querySelector('.submit').addEventListener('click', getPhotoObj)

async function getPhotoObj(){
    date = document.querySelector('.date').value
    try {
        const resp = await fetch(`https://api.nasa.gov/planetary/apod?api_key=VxIoUMlLc3MRr7kYX3WaUvlBoPvIVso8APEeBKne&date=${date}`)
        const data = await resp.json()  
		if(data['code'] == 400){
			document.querySelector('.nasaPhoto').src = '/images/NASA.png'
			document.querySelector('.nasaInfo').innerText = `Error: ${data['msg']}`
		}
		else{
			document.querySelector('.nasaPhoto').src = data['hdurl']
			document.querySelector('.nasaInfo').innerText = data['explanation']
		}

    } catch (error) {
        console.error(error)
    }
}

document.querySelector('.nasaInfoButton').addEventListener('click', showHideOverflow)

function showHideOverflow(){
	document.querySelector('.nasaInfo').classList.toggle('hideOverflow')
}


// Demacia vs. Noxus 

//Reset board
let resetButton = document.querySelector('.reset').addEventListener('click', refresh)
let nextButton1 = document.querySelector('.nextBattleV').addEventListener('click', refresh)
let nextButton2 = document.querySelector('.nextBattleD').addEventListener('click', refresh)
let nextButton3 = document.querySelector('.nextBattleT').addEventListener('click', refresh)
let turn = 0

function refresh(){
	document.querySelector('.demaciaVsNoxusTurn').innerText = `Choose a side!`
	document.querySelector('.chooseSide').style = 'display: flex;'	
	document.querySelector('.board').style = 'display: none;'
	document.querySelector('.victory').style = 'display: none;'
	document.querySelector('.defeat').style = 'display: none;'
	document.querySelector('.tie').style = 'display: none;'
	document.querySelectorAll('.dvnSpacing').forEach(div => div.innerHTML = '')
	turn = 0
}


//Pick a side
let noxusButton = document.querySelector('#NOXUS').addEventListener('click', pickSide)
let demaciaButton = document.querySelector('#DEMACIA').addEventListener('click', pickSide)
let side = ''

function pickSide(){
	side = this.innerText
	document.querySelector('.demaciaVsNoxusTurn').innerText = `${side}'s CHANCE TO ATTACK`
	document.querySelector('.chooseSide').style = 'display: none;'
	document.querySelector('.board').style = 'display: flex;'
	side == 'DEMACIA' ? turn = 0 : turn = 1
}



//Play game
let placeTokenButtons = document.querySelectorAll('.dvnSpacing')
placeTokenButtons.forEach(button => button.addEventListener('click', placeToken))

function placeToken(){
	let demaciaToken = document.createElement('img')
	demaciaToken.src = '/images/godKingGaren.png'
	demaciaToken.classList.add('image', 'fit')
	demaciaToken.style = 'object-fit: cover; margin: 0;'

	let noxusToken = document.createElement('img')
	noxusToken.src = '/images/godKingDarius.jpg'
	noxusToken.classList.add('image', 'fit')
	noxusToken.style = 'object-fit: cover; margin: 0;'

	if(this.hasChildNodes() == false && turn % 2 == 0){
		this.append(demaciaToken)
		turn ++
		document.querySelector('.demaciaVsNoxusTurn').innerText = `Noxus's CHANCE TO ATTACK`
		this.setAttribute('data-attribute', 'DEMACIA')
	}
	else if(this.hasChildNodes() == false && turn % 2 == 1){
		this.append(noxusToken)
		turn++
		document.querySelector('.demaciaVsNoxusTurn').innerText = `Demacia's CHANCE TO ATTACK`
		this.setAttribute('data-attribute', 'NOXUS')
	}

	if(determineWinner(this) != null){
		if(determineWinner(this) == side){
			document.querySelector('.demaciaVsNoxusTurn').innerText = ``
			document.querySelector('.chooseSide').style = 'display: none;'	
			document.querySelector('.board').style = 'display: none;'
			document.querySelector('.victory').style = 'display: block;'
			document.querySelector('.defeat').style = 'display: none;'
			document.querySelector('.tie').style = 'display: none;'
			Array.from(document.querySelector('.board').childNodes).filter((elem, ind, arr) => ind % 2 == 1).slice(0,9).forEach(space => space.removeAttribute('data-attribute'))
		}
		else if(determineWinner(this) == 'There were no winners in this war...'){
			document.querySelector('.demaciaVsNoxusTurn').innerText = ``
			document.querySelector('.chooseSide').style = 'display: none;'	
			document.querySelector('.board').style = 'display: none;'
			document.querySelector('.victory').style = 'display: none;'
			document.querySelector('.defeat').style = 'display: none;'
			document.querySelector('.tie').style = 'display: block;'
			Array.from(document.querySelector('.board').childNodes).filter((elem, ind, arr) => ind % 2 == 1).slice(0,9).forEach(space => space.removeAttribute('data-attribute'))
		}
		else{
			document.querySelector('.demaciaVsNoxusTurn').innerText = ``
			document.querySelector('.chooseSide').style = 'display: none;'	
			document.querySelector('.board').style = 'display: none;'
			document.querySelector('.victory').style = 'display: none;'
			document.querySelector('.defeat').style = 'display: block;'
			document.querySelector('.tie').style = 'display: none;'
			Array.from(document.querySelector('.board').childNodes).filter((elem, ind, arr) => ind % 2 == 1).slice(0,9).forEach(space => space.removeAttribute('data-attribute'))
		}

		// if(determineWinner(this) == side){
		// 	document.querySelector('.demaciaVsNoxusTurn').innerText = ``
		// 	document.querySelector('.chooseSide').style = 'display: none;'	
		// 	document.querySelector('.board').style = 'display: none;'
		// 	document.querySelector('.victory').style = 'display: block;'
		// 	document.querySelector('.defeat').style = 'display: none;'
		// 	document.querySelector('.tie').style = 'display: none;'
		// 	Array.from(document.querySelector('.board').childNodes).filter((elem, ind, arr) => ind % 2 == 1).slice(0,9).forEach(space => space.removeAttribute('data-attribute'))
		// }
		// else if(determineWinner(this) = 'There were no winners in this war...'){
		// 	document.querySelector('.chooseSide').style = 'display: none;'	
		// 	document.querySelector('.board').style = 'display: none;'
		// 	document.querySelector('.victory').style = 'display: none;'
		// 	document.querySelector('.defeat').style = 'display: none;'
		// 	document.querySelector('.tie').style = 'display: block;'
		// 	Array.from(document.querySelector('.board').childNodes).filter((elem, ind, arr) => ind % 2 == 1).slice(0,9).forEach(space => space.removeAttribute('data-attribute'))
		// }
		// else{
		// 	document.querySelector('.demaciaVsNoxusTurn').innerText = ``
		// 	document.querySelector('.chooseSide').style = 'display: none;'	
		// 	document.querySelector('.board').style = 'display: none;'
		// 	document.querySelector('.victory').style = 'display: none;'
		// 	document.querySelector('.defeat').style = 'display: block;'
		// 	document.querySelector('.tie').style = 'display: none;'
		// 	Array.from(document.querySelector('.board').childNodes).filter((elem, ind, arr) => ind % 2 == 1).slice(0,9).forEach(space => space.removeAttribute('data-attribute'))
		// }
		
	}

}


//determine if there was a winner.
function determineWinner(){
	let board = document.querySelector('.board').childNodes
	board = Array.from(board).filter((elem, ind, arr) => ind % 2 ==	  1).slice(0,9)
	let boardState = board.map(space => space.getAttribute('data-attribute'))

	switch(true){
		case boardState[0] == boardState[1] && boardState[1] == boardState[2] && boardState[1] != null:
			return boardState[1]
		case boardState[3] == boardState[4] && boardState[4] == boardState[5] && boardState[4] != null:
			return boardState[4]
		case boardState[6] == boardState[7] && boardState[7] == boardState[8] && boardState[7] != null:
			return boardState[7]
		case boardState[0] == boardState[3] && boardState[3] == boardState[6] && boardState[3] != null:
			return boardState[3]
		case boardState[1] == boardState[4] && boardState[4] == boardState[7] && boardState[4] != null:
			return boardState[4]
		case boardState[2] == boardState[5] && boardState[5] == boardState[8] && boardState[5] != null:
			return boardState[5]
		case boardState[0] == boardState[4] && boardState[4] == boardState[8] && boardState[4] != null:
			return boardState[4]
		case boardState[2] == boardState[4] && boardState[4] == boardState[6] && boardState[4] != null:
			return boardState[4]
		case boardState.includes(null):
			break;
		default:
			return 'There were no winners in this war...'
	}

}
