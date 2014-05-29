(function ()
{
    var app = angular.module('gist', ['LocalStorageModule', 'ngRoute']);

    app.controller('GistController', ['$scope', 'localStorageService', '$http', '$routeParams', '$location', function ($scope, localStorageService, http, $routeParams, $location)
    {
	    var ide = this;
	    ide.gist = { "description": "", "files": [{ "id": 0, "text": "", "name": "", "language": "text" }] };
	    ide.editors = [];
	    ide.themes = [];
	    ide.languages = [];
	    ide.message = "";

        // For some reason routeParams isn't populated right away, the timeout is a workaround.
        // https://github.com/angular/angular.js/issues/7053
	    setTimeout(function () {
	        if ($routeParams.id != null) {
	            var id = $routeParams.id;
	            if (id != null) {
	                http.get("api/gist/id/" + id).success(function (data) {
	                    ide.editors = [];
	                    ide.gist = data;
	                }).error(function (data) {
	                    ide.message = "server error" + data;
	                });;
	            }
	        }
	        else {
	            ide.message = "route error";
	        }
	    }, 500);

	    http.get('ace_themes.json').success(function (data) {
	        ide.themes = data.themes;
	    });

	    http.get('ace_languages.json').success(function (data) {
	        ide.languages = data.languages;
	    });

	    ide.userTheme = localStorageService.get('theme');
	    if (ide.userTheme === null)
	        ide.userTheme = "eclipse";
        
	    $scope.$on('onRepeatLast', function (scope, element, attrs) {
	        for (var i = 0; i < ide.gist.files.length; i++) {
	            if (i >= ide.editors.length) {
	                var id = "editor" + i;
	                var editor = ace.edit(id);
	                editor.setValue(ide.gist.files[i].text);
	                editor.selection.selectTo(0, 0);
	                editor.setOptions({ maxLines: 50 });
	                editor.setTheme("ace/theme/" + ide.userTheme);
	                editor.getSession().setMode("ace/mode/" + ide.gist.files[i].language);
                    editor.getSession().setTabSize( 4 );
                    editor.getSession().setUseSoftTabs(true);
	                ide.editors.push(editor);
	            }
	        }
	    });

	    this.addFile = function () {
	        ide.gist.files.push({ "id": ide.gist.files.length, "text": "", "language": ide.gist.files[ide.gist.files.length - 1].language });
	    };

	    this.handleThemeChange = function () {
	        localStorageService.set('theme', ide.userTheme);
	        for (var i = 0; i < ide.editors.length; i++) {
	            ide.editors[i].setTheme("ace/theme/" + ide.userTheme);
	        }
	    };

	    this.languageChanged = function (id, language) {
	        ide.editors[id].getSession().setMode("ace/mode/" + language);
	    };

	    this.save = function () {
	        for (var i = 0; i < ide.editors.length; i++) {
	            var file = ide.gist.files[i];
	            file.text = ide.editors[i].getValue();
	        }
	        http.post('/save', ide.gist).success(function (data) {
	            $location.path('/id/' + data).replace();
	            ide.message = "Gist saved. Permalink: " + $location.absUrl();
	        }).error(function (data) {
	            ide.message = "error " + data;
	        });
	    };
	}]);

	app.directive('onLastRepeat', function () {
	    return function (scope, element, attrs) {
	        if (scope.$last) {
	            setTimeout(function () {
	                scope.$emit('onRepeatLast', element, attrs);
	            }, 1);
	        }
	    };
	});

	app.config(function ($routeProvider) {
	    $routeProvider.when("/id/:id", {
	    }).
        otherwise({
            redirectTo: "/"
        });
	});

})();
