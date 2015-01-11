Accounts.oauth.tryConnectAfterPopupClosed = function (credentialToken, callback) {
	var credentialSecret = OAuth._retrieveCredentialSecret(credentialToken) || null;
	var options = {
		oauth: {
			credentialToken: credentialToken,
			credentialSecret: credentialSecret
		}
	};
	Meteor.call("addLoginService", options, function (error) {
		if (callback) {
			callback(error);
		}
	});
};

Accounts.oauth.connectCredentialRequestCompleteHandler = function (callback) {
	return function (credentialTokenOrError) {
		if (credentialTokenOrError && credentialTokenOrError instanceof Error) {
			if (callback) {
				callback(credentialTokenOrError);
			}
		} else {
			Accounts.oauth.tryConnectAfterPopupClosed(credentialTokenOrError, callback);
		}
	};
};

var makePascalCased = function (word) {
	return word[0].toUpperCase() + word.slice(1).toLowerCase();
};

Meteor.connectWith = function (servicePackage, serviceName, options, callback) {
	// Support a callback without options
	if (!callback && typeof options === "function") {
		callback = options;
		options = null;
	}
	var connectCredentialRequestCompleteCallback = Accounts.oauth.connectCredentialRequestCompleteHandler(callback);
	var Service = Package[servicePackage][serviceName || makePascalCased(servicePackage)];
	Service.requestCredential(options, connectCredentialRequestCompleteCallback);
};
