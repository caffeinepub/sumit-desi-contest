import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  type GameResult = {
    player : Principal;
    playerNumbers : [Nat];
    computerNumbers : [Nat];
    matches : Nat;
    isWin : Bool;
  };

  module GameResult {
    public func compare(result1 : GameResult, result2 : GameResult) : Order.Order {
      if (result1.matches < result2.matches) {
        #less;
      } else if (result1.matches > result2.matches) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  let gameResults = Map.empty<Principal, [GameResult]>();

  public query ({ caller }) func getPlayerResults(player : Principal) : async [GameResult] {
    switch (gameResults.get(player)) {
      case (null) { Runtime.trap("No games found for this player") };
      case (?results) { results };
    };
  };

  // Helper function to flatten arrays from an iterator
  func flattenArrays(iter : Iter.Iter<[GameResult]>) : [GameResult] {
    func concatArrays(array1 : [GameResult], array2 : [GameResult]) : [GameResult] {
      array1.concat(array2);
    };
    iter.foldLeft([], concatArrays);
  };

  public query ({ caller }) func getAllResults() : async [GameResult] {
    flattenArrays(gameResults.values()).sort();
  };
};
