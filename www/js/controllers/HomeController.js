(function(){
  angular.module('starter')
  .controller('HomeController', ['$scope', HomeController]);

  function HomeController($scope){

    var me = this;
    $scope.has_joined = false;
    $scope.ready = false;

    const horizon = Horizon({host: 'localhost:8181'});
    horizon.onReady(function(){
      $scope.$apply(function(){
        $scope.ready = true;
      });
    });

    horizon.connect();

    $scope.join = function(username, room){

      me.room = horizon('tictactoe');

      var id = chance.integer({min: 10000, max: 999999});
      me.id = id;

      $scope.player = username;
      $scope.player_score = 0;

      me.room.findAll({room: room, type: 'user'}).fetch().subscribe(function(row){
        var user_count = row.length;

        if(user_count == 2){
          alert('Sorry, room is already full.');
        }else{
          me.piece = 'X';
          if(user_count == 1){
            me.piece = 'O';
          }

          me.room.store({
            id: id,
            room: room,
            type: 'user',
            name: username,
            piece: me.piece
          });

          $scope.has_joined = true;

          me.room.findAll({room: room, type: 'user'}).watch().subscribe(
            function(users){

              users.forEach(function(user){

                if(user.id != me.id){

                  $scope.$apply(function(){
                    $scope.opponent = user.name;
                    $scope.opponent_piece = user.piece;
                    $scope.opponent_score = 0;
                  });

                }

              });

            },
            function(err){
              console.log(err);
            }
          );


          me.room.findAll({room: room, type: 'move'}).watch().subscribe(
            function(moves){
              moves.forEach(function(item){

                var block = document.getElementById(item.block);
                block.innerHTML = item.piece;
                block.className = "col done";

              });

              me.updateScores();

            },
            function(err){
              console.log(err);
            }
          );
        }

      });

    }


    $scope.placePiece = function(id){

      var block = document.getElementById(id);

      if(!angular.element(block).hasClass('done')){
        me.room.store({
          type: 'move',
          room: me.room_name,
          block: id,
          piece: me.piece
        });
      }

    };


    me.updateScores = function(){

      const possible_combinations = [
        [1, 4, 7],
        [2, 5, 8],
        [3, 2, 1],
        [4, 5, 6],
        [3, 6, 9],
        [7, 8, 9],
        [1, 5, 9],
        [3, 5, 7]
      ];

      var scores = {'X': 0, 'O': 0};
      possible_combinations.forEach(function(row, row_index){
        var pieces = {'X' : 0, 'O': 0};
        row.forEach(function(id, item_index){
          var block = document.getElementById(id);
          if(angular.element(block).hasClass('done')){
            var piece = block.innerHTML;
            pieces[piece] += 1;
          }
        });

        if(pieces['X'] == 3){
          scores['X'] += 1;
        }else if(pieces['O'] == 3){
          scores['O'] += 1;
        }
      });

      $scope.$apply(function(){
        $scope.player_score = scores[me.piece];
        $scope.opponent_score = scores[$scope.opponent_piece];
      });
    }

  }

})();
