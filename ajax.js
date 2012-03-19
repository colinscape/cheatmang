// From Steven Levithan's "Faster JavaScript Trim"
// http://blog.stevenlevithan.com/archives/faster-trim-javascript
function trim(string) {
	return string.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
}

var warnP = $("#warn");
var failP = $("#fail");
var successP = $("#success");
var deckTextArea = $("#deckText");
var cardTotalP = $("#cardTotal");
var footer = $("footer");
var timeout = 3000; // ms

// Don't load pictures while deck is being edited
var updating = false;

var cumulativeCards = 0;

function urlCCGCardSearch(name) {
	return "http://daccg.com/ajax_ccgsearch.php?db=mtg&cardname=" + name;
}

function showCost(name) {
	$.ajax({
		type: "GET",
		timeout: timeout,
		url: urlCCGCardSearch(name),
		cache: false,
		complete: function (response) {
			var o = $.parseJSON(response.responseText);

			$(name).html(o.cost);

			// ...
		},
		error: function (req, status, err) {}
	});
}

function showCard(name, quantity) {
	name = name.replace(/\'/, "&#39;");

	var card = "<div id='" + name + "' />" + quantity + " " + name + "</div>";

	footer.append(card);
	showCost(name);

	cumulativeCards++;

	if (cumulativeCards % 2 == 0) {
		footer.append("<br/>");
	}
}

function addCosts(cards) {
	// Clear footer
	footer.html("");

	for (var i = 0; i < cards.length; i++) {
		var quantity = cards[i].quantity;
		var name = cards[i].name;
		var edition = cards[i].edition;

		showCard(name, quantity);
	}
}

function fireUpdate() {
	while (updating) {}

	setTimeout(update, 0);
}

function update() {
	cumulativeCards = 0;
	success("");
	warn("");
	fail("");

	updating = true;

	try {
		var deckString = deckTextArea.val();

		var cards = deckString.split("\n");

		if (cards.length < 1) {
			throw "Empty deck.";
		}

		var deckCards = 0;

		var hasSideboard = false;
		var sideboardCards = 0;

		var cardObjects = [];
		for (var i = 0; i < cards.length; i++) {
			var card = trim(cards[i]);

			// Skip empty lines and comments
			if (card == "" || card.indexOf("//") == 0) {
				continue;
			}
			else {
				var willSideboard = card.indexOf("SB:") == 0;

				hasSideboard = hasSideboard || willSideboard;

				if (willSideboard) {
					card = card.substring(3);
					card = trim(card);
				}

				var quantity = parseInt(card);

				if (isNaN(quantity)) {
					quantity = 1;
				}
				else {
					var quantityString = quantity.toString();
					card = card.substring(quantityString.length + 1);
				}

				if (quantity < 1) {
					traceFormat(i, cards[i]);
				}

				var name = card.trim();

				if (name.length < 1) {
					traceFormat(i, cards[i]);
				}

				var edition = "";
				var matches = name.match(/\[[a-zA-Z]+\]/);
				if (matches != null) {
					if (matches.length > 1) {
						traceFormat(i, cards[i]);
					}
					else {
						edition = matches[0];
						name = name.substring(edition.length + 1);

						edition = edition.substring(1, edition.length - 1);
					}
				}

				if (name.length < 1) {
					traceFormat(i, cards[i]);
				}

				cardObjects.push({"quantity": quantity, "name": name, "edition": edition});

				if (willSideboard) {
					sideboardCards += quantity;
				}
				else {
					deckCards += quantity;
				}
			}
		}

		var cardTotalMessage = "Deck: " + deckCards + " cards";
		if (hasSideboard) {
			cardTotalMessage += " + sideboard"
		}

		cardTotalP.html(cardTotalMessage);

		if (deckCards < 60) {
			warn("Decks are typically 60 or more cards.");
		}
		else if (hasSideboard && sideboardCards < 15) {
			warn("Sideboard needs " + (15 - sideboardCards) + " more cards.");
		}
		else if (hasSideboard && sideboardCards > 15) {
			warn("Sideboard needs " + (sideboardCards - 15) + " fewer cards.");
		}

		addCosts(cardObjects);
	}
	catch (error) {
		fail(error);
	}

	updating = false;
}

function success(message) {
	successP.attr("style", "color: green");
	successP.html(message);
}

function warn(message) {
	warnP.attr("style", "color: orange");
	warnP.html(message);
}

function fail(message) {
	failP.attr("style", "color: red");
	failP.html(message);
}

function trace(message, line, input) {
	throw "Line " + (line + 1) + ": " + input + "<br/>&nbsp;&nbsp;&nbsp;" + message;
}

function traceFormat(line, input) {
	trace("Syntax error", line, input);
}