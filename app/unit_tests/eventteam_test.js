describe("Event Team Functions", function() {
    describe("parseTeams", function() {
        it("parse the team firebaseObject to a JavaScript array", function() {
            var teamObj = {
                team1: {
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    $loaded: function() {
                        console.log("$loaded()");
                    }
                }
            };
            var userObj = {uid: "uid", name: "name", skills: ["Programming"]};

            var expected = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch: {match:["Programming"], number: 1 },
                    missingSkillsMatch: {match: [], number: 0 }
                }
            ];

            expect(parseTeams(teamObj, userObj)).toEqual(expected);
        });

        it("parse the team firebaseObject to a JavaScript array", function() {
            var teamObj = {
                team1: {
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    $loaded: function() {
                        console.log("$loaded()");
                    }
                }
            };
            var userObj = null;

            var expected = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch: null,
                    missingSkillsMatch: null
                }
            ];

            expect(parseTeams(teamObj, userObj)).toEqual(expected);
        });

        it("special properties with special key", function() {
            var teamObj = {
                "$property": "$property",
                "_property": "_property",
                ".property": ".property"
            };
            var userObj = {};

            var expected = [];

            expect(parseTeams(teamObj, userObj)).toEqual(expected);
        });
    });
});


describe("Event Team Controller", function() {
    beforeEach(module("teamform-eventteam-app"));

    var $controller, $firebaseObject, $firebaseArray, $mdDialog;

    var adminObj = {
        admin: {
            param: {
                maxTeamSize: 10,
                minTeamSize: 1
            }
        }
    };

    var teamObj = {
        team: {
            team: {
                size: 5,
                currentTeamSize: 1,
                skills: ["Programming"],
                teamMembers: [
                    {uid: "uid", name: "member", skills: ["Programming"]}
                ],
                teamSkills: ["Programming"]
            }
        }
    };

    beforeEach(inject(function(_$controller_, _$firebaseObject_, _$firebaseArray_, _$mdDialog_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;

        // mock $firebaseObject
        $firebaseObject = jasmine.createSpy("$firebaseObject");
        $firebaseObject.and.callFake(function(ref) {
            var refUrl = ref.toString();
            var refUrlSplit = refUrl.split("/");
            var refUrlSplitLength = refUrlSplit.length;

            // https://team-form-4ffd7.firebaseio.com/.../admin/param
            if (refUrlSplit[refUrlSplitLength-2] === "admin" && refUrlSplit[refUrlSplitLength-1] === "param") {
                var obj = adminObj.admin.param;
                obj.$loaded = function() {return {then: function(callback) {callback(adminObj.admin.param);}};};

                return obj;
            }

            // https://team-form-4ffd7.firebaseio.com/.../team/
            if (refUrlSplit[refUrlSplitLength-1] === "team") {
                var obj = teamObj.team.team;
                obj.$loaded = function() {return {then: function(callback) {callback(teamObj.team);}};};

                return obj;
            }
        });

        $firebaseArray = _$firebaseArray_;

        $mdDialog = _$mdDialog_;
    }));

    beforeEach(function() {
        // spyOn getURLParameter
        getURLParameter = jasmine.createSpy("getURLParameter").and.callFake(function(parameterName) {
            return "test";
        });
    });

    beforeEach(function() {
        // mock firebase reference update
        spyOn(firebase.database.Reference.prototype, "update").and.callFake(function(obj) {
            console.log("update", obj);
        });

        // mock firebase reference set
        spyOn(firebase.database.Reference.prototype, "set").and.callFake(function(obj) {
            console.log("set", obj);
        });
    });

    beforeEach(function() {
        // mock document querySelector that a snackbar is showed for notification
        spyOn(document, "querySelector").and.callFake(function(selector) {
            if (selector === ".mdl-js-snackbar") {
                return {MaterialSnackbar: {showSnackbar: function(data) {console.log("snackbar", data.message);}}};
            }
        });
    });

    afterEach(function() {
        firebase.app().delete();
    });


    describe("firebase authentication", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        beforeEach(function() {
            var user = {uid: "uid", displayName: "name"};

            // mock firebase auth onAuthStateChanged that a user is signed in
            spyOn(firebase.auth.Auth.prototype, "onAuthStateChanged").and.callFake(function(callback) {
                callback(user);
            });

            // mock $scope.$apply
            $scope.$apply = jasmine.createSpy("$apply").and.callFake(function(callback) {
                callback();
            });
        });

        it("user is signed in", function() {

        });

        it("no user is signed in", function() {
            // mock firebase auth onAuthStateChanged that no user is signed in
            firebase.auth.Auth.prototype.onAuthStateChanged.and.callFake(function(callback) {
                callback(null);
            });

            expect($scope.user).toBeNull();
            expect($scope.userObj).toBeNull();
        });
    });


    describe("load data", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        it("load data", function() {
            expect($scope.minTeamSize).toEqual(adminObj.admin.param.minTeamSize);
            expect($scope.maxTeamSize).toEqual(adminObj.admin.param.maxTeamSize);
            expect($scope.startDate).toEqual(adminObj.admin.param.startDate);
            expect($scope.endDate).toEqual(adminObj.admin.param.endDate);
            expect($scope.details).toEqual(adminObj.admin.param.details);
        });
    });


    describe("$scope.filterPlaces", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        it("filter teams that still have places left", function() {
            var teams = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                },
                {
                    name: "team2",
                    size: 1,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                }
            ];

            var expected = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                }
            ];

            expect($scope.filterPlaces(teams)).toEqual(expected);
        });
    });


    describe("$scope.sortPlaces", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        it("sort the teams by the number of places left", function() {
            var teams = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                },
                {
                    name: "team2",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                },
                {
                    name: "team4",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                }
            ];

            var expected = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                },
                {
                    name: "team2",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                },
                {
                    name: "team4",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ]
                }
            ];

            expect($scope.sortPlaces(teams)).toEqual(expected);
        });
    });


    describe("$scope.filterSkillsMatch", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        it("filter the teams that have skills that the user has", function() {
            var teams = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming", "Android", "C++"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:["Android","C++"], number: 2 }
                },
                {
                    name: "team2",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming","Beta"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:[], number: 0 }
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:["Delta"], number: 1 }
                },
                {
                    name: "team4",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:[""], number: 0 }
                }
            ];
            var expected = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming", "Android", "C++"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:["Android","C++"], number: 2 }
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:["Delta"], number: 1 }
                }
            ];
            expect($scope.filterSkillsMatch(teams)).toEqual(expected);
        });
    });

    describe("$scope.filterMissingSkillsMatch", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        it("filter the teams that missing skills that the user has", function() {
            var teams = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming", "Android", "C++"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch: {match:["Android","C++"], number: 2 },
                    missingSkillsMatch: {match:["Android", "C++"], number: 2 }
                },
                {
                    name: "team2",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming","Beta"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:[], number: 0 },
                    missingSkillsMatch: {match:[], number: 0 }
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:["Delta"], number: 1 },
                    missingSkillsMatch: {match:["Delta"], number: 1 }
                },
                {
                    name: "team4",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:[""], number: 0 },
                    missingSkillsMatch: {match:[], number: 0 }
                },
                {
                    name: "team5",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]},
                        {uid: "uid", name: "name", skills: ["Delta"]}
                    ],
                    teamSkills: ["Programming", "Delta"],
                    skillsMatch:{match:["Delta"], number: 1 },
                    missingSkillsMatch: {match:[], number: 0 }
                }
            ];
            var expected = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming", "Android", "C++"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch: {match:["Android","C++"], number: 2 },
                    missingSkillsMatch: {match:["Android", "C++"], number: 2 }
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:["Delta"], number: 1 },
                    missingSkillsMatch: {match:["Delta"], number: 1 }
                }
            ];
            expect($scope.filterMissingSkillsMatch(teams)).toEqual(expected);
        });
    });


    describe("$scope.sortSkillsMatch", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        it("sort the teams by the number of skills matched", function() {
            var teams = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming", "Android", "C++"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:["Android","C++"], number: 2 }
                },
                {
                    name: "team2",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming","Beta"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:[], number: 0 }
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:["Delta"], number: 1 }
                },
                {
                    name: "team4",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:[""], number: 0 }
                }
            ];

            var expected = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming", "Android", "C++"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:["Android","C++"], number: 2 }
                },

                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:["Delta"], number: 1 }
                },
                {
                    name: "team2",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming","Beta"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:[], number: 0 }
                },
                {
                    name: "team4",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    skillsMatch:{match:[""], number: 0 }
                }
            ];
            expect($scope.sortSkillsMatch(teams)).toEqual(expected);
        });
    });

    describe("$scope.sortMissingSkillsMatch", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        it("sort the teams by the number of missing skills matched", function() {
            var teams = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming", "Android", "C++"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch: {match:["Android","C++"], number: 2 },
                    missingSkillsMatch: {match:["Android", "C++"], number: 2 }
                },
                {
                    name: "team2",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming","Beta"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:[], number: 0 },
                    missingSkillsMatch: {match:[], number: 0 }
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:["Delta"], number: 1 },
                    missingSkillsMatch: {match:["Delta"], number: 1 }
                },
                {
                    name: "team4",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:[""], number: 0 },
                    missingSkillsMatch: {match:[], number: 0 }
                },
                {
                    name: "team5",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]},
                        {uid: "uid", name: "name", skills: ["Delta"]}
                    ],
                    teamSkills: ["Programming", "Delta"],
                    skillsMatch:{match:["Delta"], number: 1 },
                    missingSkillsMatch: {match:[], number: 0 }
                }
            ];

            var expected = [
                {
                    name: "team1",
                    size: 5,
                    currentTeamSize: 1,
                    skills: ["Programming", "Android", "C++"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch: {match:["Android","C++"], number: 2 },
                    missingSkillsMatch: {match:["Android", "C++"], number: 2 }
                },
                {
                    name: "team3",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:["Delta"], number: 1 },
                    missingSkillsMatch: {match:["Delta"], number: 1 }
                },
                {
                    name: "team2",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming","Beta"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:[], number: 0 },
                    missingSkillsMatch: {match:[], number: 0 }
                },
                {
                    name: "team4",
                    size: 2,
                    currentTeamSize: 1,
                    skills: ["Programming"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]}
                    ],
                    teamSkills: ["Programming"],
                    skillsMatch:{match:[""], number: 0 },
                    missingSkillsMatch: {match:[], number: 0 }
                },
                {
                    name: "team5",
                    size: 4,
                    currentTeamSize: 1,
                    skills: ["Programming", "Delta", "Python"],
                    teamMembers: [
                        {uid: "uid", name: "name", skills: ["Programming"]},
                        {uid: "uid", name: "name", skills: ["Delta"]}
                    ],
                    teamSkills: ["Programming", "Delta"],
                    skillsMatch:{match:["Delta"], number: 1 },
                    missingSkillsMatch: {match:[], number: 0 }
                }
            ];
            expect($scope.sortMissingSkillsMatch(teams)).toEqual(expected);
        });
    });


    describe("$scope.filterTeams", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        beforeEach(function() {
            // spyOn $scope filterPlaces
            spyOn($scope, "filterPlaces").and.callFake(function(teams) {
                return teams;
            });

            // spyOn $scope filterSkillsMatch
            spyOn($scope, "filterSkillsMatch").and.callFake(function(teams) {
                return teams;
            });

            // spyOn $scope filterMissingSkillsMatch
            spyOn($scope, "filterMissingSkillsMatch").and.callFake(function(teams) {
                return teams;
            });
        });

        it("no filter", function() {
            var filterPlacesSwitch = false;
            var filterSkillsMatchSwitch = false;
            var filterMissingSkillsMatchSwitch = false;
            $scope.dbTeams = [];
            $scope.dbTeams = null;

            $scope.filterTeams(filterPlacesSwitch, filterSkillsMatchSwitch, filterMissingSkillsMatchSwitch);

            expect($scope.teams).toEqual($scope.dbTeams);
        });

        it("filter teams that still have places left", function() {
            var filterPlacesSwitch = true;
            var filterSkillsMatchSwitch = false;
            var filterMissingSkillsMatchSwitch = false;
            $scope.dbTeams = [];
            $scope.dbTeams = null;

            $scope.filterTeams(filterPlacesSwitch, filterSkillsMatchSwitch, filterMissingSkillsMatchSwitch);

            expect($scope.teams).toEqual($scope.dbTeams);
        });

        it("filter teams that match the signed in user skills", function() {
            var filterPlacesSwitch = false;
            var filterSkillsMatchSwitch = true;
            var filterMissingSkillsMatchSwitch = false;
            $scope.dbTeams = [];
            $scope.dbTeams = null;

            $scope.filterTeams(filterPlacesSwitch, filterSkillsMatchSwitch, filterMissingSkillsMatchSwitch);

            expect($scope.teams).toEqual($scope.dbTeams);
        });

        it("filter teams that missing the signed in user skills", function() {
            var filterPlacesSwitch = false;
            var filterSkillsMatchSwitch = false;
            var filterMissingSkillsMatchSwitch = true;
            $scope.dbTeams = [];
            $scope.dbTeams = null;

            $scope.filterTeams(filterPlacesSwitch, filterSkillsMatchSwitch, filterMissingSkillsMatchSwitch);

            expect($scope.teams).toEqual($scope.dbTeams);
        });
    });

    describe("$scope.sortTeams", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        beforeEach(function() {
            // spyOn $scope sortPlaces
            spyOn($scope, "sortPlaces").and.callFake(function(teams) {
                return teams;
            });

            // spyOn $scope sortSkillsMatch
            spyOn($scope, "sortSkillsMatch").and.callFake(function(teams) {
                return teams;
            });

            // spyOn $scope sortMissingSkillsMatch
            spyOn($scope, "sortMissingSkillsMatch").and.callFake(function(teams) {
                return teams;
            });
        });

        beforeEach(function() {
            $scope.filterPlacesSwitch = false;
            $scope.filterSkillsMatchSwitch = false;
            $scope.filterMissingSkillsMatchSwitch = false;
        });

        it("sort teams by the number of places left", function() {
            var sortBy = "places";
            $scope.sortPlacesSwitch = true;
            $scope.sortSkillsMatchSwitch = false;
            $scope.sortMissingSkillsMatchSwitch = false;
            $scope.teams = [];

            $scope.sortTeams(sortBy);

            expect($scope.sortSkillsMatchSwitch).toBeFalsy();
            expect($scope.sortMissingSkillsMatchSwitch).toBeFalsy();
        });

        it("sort teams by the number of skills matched", function() {
            var sortBy = "skillsMatch";
            $scope.sortPlacesSwitch = false;
            $scope.sortSkillsMatchSwitch = true;
            $scope.sortMissingSkillsMatchSwitch = true;
            $scope.teams = [];

            $scope.sortTeams(sortBy);

            expect($scope.sortPlacesSwitch).toBeFalsy();
            expect($scope.sortMissingSkillsMatchSwitch).toBeFalsy();
        });

        it("sort teams by the number of missing skills matched", function() {
            var sortBy = "missingSkillsMatch";
            $scope.sortPlacesSwitch = false;
            $scope.sortSkillsMatchSwitch = false;
            $scope.sortMissingSkillsMatchSwitch = true;
            $scope.teams = [];

            $scope.sortTeams(sortBy);

            expect($scope.sortPlacesSwitch).toBeFalsy();
            expect($scope.sortSkillsMatchSwitch).toBeFalsy();
        });

        it("no sort", function() {
            var sortBy = "noSort";
            $scope.sortPlacesSwitch = false;
            $scope.sortSkillsMatchSwitch = false;
            $scope.sortMissingSkillsMatchSwitch = false;
            $scope.teams = [];

            $scope.sortTeams(sortBy);
        });
    });


    describe("$scope.createTeam", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        beforeEach(function() {
            // mock $mdDialog.show
            spyOn($mdDialog, "show").and.callFake(function(options) {
                return {then: function(callback) {callback("team")}};
            });
        });

        beforeEach(function() {
            $scope.minTeamSize = 1;
            $scope.maxTeamSize = 10;
        });

        it("create a team", function() {
            $scope.createTeam();

            expect($mdDialog.show).toHaveBeenCalled();
            expect(firebase.database.Reference.prototype.set).toHaveBeenCalledWith({size: 5, currentTeamSize: 0});
        });
    });


    describe("$scope.requestTeam", function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller("EventTeamCtrl", {$scope: $scope, $firebaseObject: $firebaseObject, $firebaseArray: $firebaseArray, $mdDialog: $mdDialog});
        });

        beforeEach(function() {
            $scope.user = {
                uid: "uid",
                name: "name"
            };

            // mock $firebaseArray object $loaded
            spyOn($firebaseArray.prototype, "$loaded").and.callFake(function() {
                return {then: function(callback) {callback([{$value: "team1"}]);}};
            });
        });

        it("request joining a team", function() {
            $scope.requestTeam("team2");

            expect($firebaseArray.prototype.$loaded).toHaveBeenCalled();
            expect(firebase.database.Reference.prototype.set).toHaveBeenCalledWith(["team1", "team2"]);
        });
    });
});
