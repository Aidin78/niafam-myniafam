
define("tinymce/codesampleplugin/Utils", [
], function() {
	function isCodeSample(elm) {
		return elm && elm.nodeName == 'PRE' && elm.className.indexOf('language-') !== -1;
	}

	function trimArg(predicateFn) {
		return function(arg1, arg2) {
			return predicateFn(arg2);
		};
	}

	return {
		isCodeSample: isCodeSample,
		trimArg: trimArg
	};
});