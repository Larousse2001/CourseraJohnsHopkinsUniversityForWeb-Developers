(function() {
  "use strict";

  angular.module("NarrowItDownApp", [])
    .controller("NarrowItDownController", NarrowItDownController)
    .service("MenuSearchService", MenuSearchService)
    .directive("foundItems", FoundItemsDirective)
    .constant("ApiBasePath", "https://davids-restaurant.herokuapp.com");

  /*** CONTROLLERS ***********************************************************/
  NarrowItDownController.$inject = ["MenuSearchService"];
  function NarrowItDownController(MenuSearchService) {
    var ctrl = this;
    ctrl.searchFor = "";
    ctrl.searchResult = ""; //Set to empty string if all OK
    ctrl.found = [];

    /*--- Methods -----------------------------------------------------------*/
    ctrl.search = function() {
      //If textbox not empty - do search...
      if(ctrl.searchFor && ctrl.searchFor.length > 0) {
        ctrl.searchResult = "";
        var promise = MenuSearchService.getMatchedMenuItems(ctrl.searchFor);

        promise.then(function(result) {
          ctrl.found = result;
          if(ctrl.found.length === 0) {
            ctrl.searchResult = "Nothing found (matching \"" + ctrl.searchFor + "\")";
          }
        });
      }
      else
      {
        ctrl.searchResult = "Nothing found";
      }
    };

    ctrl.dontWant = function(index) {
      console.log("Index: ", index);
      ctrl.found.splice(index, 1);
    };
  }

  /*** SERVICES **************************************************************/
  MenuSearchService.$inject = ["$http", "ApiBasePath"];
  function MenuSearchService($http, ApiBasePath) {
    var service = this;

    service.getMatchedMenuItems = function(searchTerm) {
      return $http({
        method: "GET",
        url: (ApiBasePath + "/menu_items.json")
      })
        .then(function(response){
          var menuItems = response.data;
          var foundItems = filterOnDescription(menuItems.menu_items, searchTerm);

          return foundItems;
        });
    };

    //Return list where desciption contains searchTerm
    function filterOnDescription(list, searchTerm) {
      var newList = [];

      for(var i = 0; i < list.length; i++) {
        if(list[i].description.toUpperCase().indexOf(searchTerm.toUpperCase()) > 0) {
          newList.push(list[i]);
        }
      }

      return newList;
    }
  }

  /*** DIRECTIVES ************************************************************/
  function FoundItemsDirective() {
    var ddo = {
      templateUrl: "loader/itemList.html",
      scope: {
        list: "<",
        title: "@title",
        result: "@result",
        dontWant: "&"
      },
    };
    return ddo;
  }
})();
