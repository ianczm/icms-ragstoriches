import { Character } from '../../types/Character';
import { getFirestore, doc, setDoc, getDoc, Firestore } from "firebase/firestore";
import { calculateScore, constructCharacter, rememberOption } from '../../utils/CharacterUtils';


// Usage Flow
// 1. create new scenario, constructing with character as the one to be modified
// 2. listen for options selected via updateSelectedOptions()
//      - perform realtime database update
// 3. listen for answer submission via submitAnswer()
//      - check if multiple options are selected
//      - processes selected options --> calculation done here
//      - updates character and history
// 4. always listen for firebase updates e.g. allowMultipleSelections

// 0/5. push or pay any assets or liabilities --> show in outcome page
// >>>>>>>>>>> new scenario >>>>>>>>>>>>>
// 1. load age from scenarioContent
// 2. set character age to match scenario
// 3. auto pay after updating age --> remember value
// 4. submit choice as usual
// >>>>>>>>>>> finish scenario >>>>>>>>>>>>>
// 5/0. repeat

class Scenario {

  db: Firestore;
  character: Character;
  currentPage: number;
  selectionsReady: boolean;
  selections: Array<number>;
  allowMultipleSelection: boolean;
  hasCompleted: boolean;

  scenarioAge: number;

  constructor(character: Character, currentPage: number, allowMultipleSelection: boolean) {

    // Initialise firebase
    this.db = getFirestore();

    // Reference the original character object
    this.character = character;

    this.scenarioAge = 1,

    // Scenario current page
    this.currentPage = currentPage;
    this.hasCompleted = false;
    // Update current page of character
    // [!] need to find out how to update currentPage in the database

    // User selected options
    this.selectionsReady = false;
    this.selections = [];
    this.getDatabaseSelections();

    this.allowMultipleSelection = allowMultipleSelection;
  }

  // Public, onClick event
  updateSelectedOptions(optionNumber: number) {
    // To update the database as participants select options
    // to be displayed to others in real time

    if (this.selections.includes(optionNumber)) {
      // toggle behavior: deactivate selection if already active
      this.selections = this.selections.filter((option) => {
        return option != optionNumber;
      })
    } else {
      // normal behavior, add option
      if (this.selections && this.allowMultipleSelection) {
        // if there is another selection already, check if ms is enabled
        this.selections.push(optionNumber);
      } else {
        // if not, set first element to optionNumber
        this.selections[0] = optionNumber;
      }
    }
    // Update database with options

    this.createOrUpdateDatabaseInstance();

  }

  // Public, onClick event
  submitAnswer() {
    // Perform multiple selection validation
    try {
      if (!this.selections) {
        throw {
          name: "NoSelectionError",
          message: "Please choose at least one option."
        }
      } else if (this.selections.length > 1 && !this.allowMultipleSelection) {
        throw {
          name: "MultipleSelectionError",
          message: "You may only choose one option."
        }
      }

      // Proceed with answer processing
      rememberOption(this.character, this.selections[0]);

      this.processAnswer();

      // Update character upon submit after perfoming
      // logic and calculations
      calculateScore(this.character);

      // Find a way to update the database
      this.hasCompleted = true;

      this.createOrUpdateDatabaseInstance();
      this.updateCharacterDatabaseInstance();

    } catch (e) {
      // Somehow render this to HTML
      alert(e.name + " " + e.message);
    }
  }

  // Private, to be overridden by subclasses
  processAnswer(): void {
    // Logic for performing calculations
    this.character.age += 1;
    this.character.balanceSheet.cash += 5000;
    this.character.happiness *= 1.01;
    this.character.stress *= 1.01;
    this.character.health *= 1.01;
    this.character.security *= 1.01;
  }

  // Private, to be overridden by subclasses
  generateCase(): number {
    // Logic for parsing user input and generating
    // a case depending on combination of selections.

    // Used in processAnswer to determine what calculation
    // to perform

    // e.g. if options 2 and 3 are selected, generate case 5

    // this.currentlySelectedOptions
    return 1;
  }

  // Private, validation check
  canProceedWithMultipleSelection(): boolean {
    return this.allowMultipleSelection && this.selections.length >= 1;
  }

  // Private, create new database instance
  async createOrUpdateDatabaseInstance() {
    await setDoc(doc(this.db, "character_scenario", `${this.character.id}_${this.currentPage}`), {
      selections: this.selections,
      hasCompleted: this.hasCompleted
    });
  }

  async updateCharacterDatabaseInstance() {
    console.log("After submission: " + this.hasCompleted);
    await setDoc(doc(this.db, "character", `${this.character.id}`), 
      this.character
    );
  }

  // Private, creates a new database instance if it doesn't exist, if not,
  // just loads regularly
  async getDatabaseSelections() {
    // if does not exist, create new
    const instanceRef = doc(this.db, "character_scenario", `${this.character.id}_${this.currentPage}`);
    await getDoc(instanceRef).then((instance) => {
      if (instance.exists()) {
        this.selectionsReady = true;
        this.selections = instance.data().selections;
        this.hasCompleted = instance.data().hasCompleted;
        // added age --> to set character to an age
        this.scenarioAge = instance.data().scenarioAge;
      } else {
        setDoc(instanceRef, {
          selections: this.selections,
          hasCompleted: this.hasCompleted
        });
      }
    });
  }


  currentAssets() {
    const calculateYield = (currSum, asset) => {
      const diff = this.character.age - asset.startAge;
      if (diff >= asset.durationYears) {
        return (
          currSum +
          asset.amount * Math.pow(1 + asset.interest, asset.durationYears)
        );
      } else {
        return currSum + asset.amount * Math.pow(1 + asset.interest, diff);
      }
    };

    return this.character.balanceSheet.assets.reduce(calculateYield, 0);
  }

  currentLiabilities() {
    const calculateDebt = (currSum, liability) => {
      const diff = this.character.age - liability.startAge;
      if (diff >= liability.durationYears) {
        return currSum;
      } else {
        const total =
          liability.amount * (1 + liability.interest * liability.durationYears);
        const paid = (total / liability.durationYears) * diff;
        return currSum + total - paid;
      }
    };

    return this.character.balanceSheet.liabilities.reduce(calculateDebt, 0);
  }
}

export { Scenario };
