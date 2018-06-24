module itweet.overview {

    export class RHBOverviewController extends OverviewController {

        protected network: itweet.model.RHBServiceFactory;

        validateTweet(currentTweet){
            if (this.isCatergoryIeadsProposal()) {
                if (currentTweet.textIdeaWhat && currentTweet.textIdeaWho && currentTweet.textIdeaWhy && currentTweet.textIdeaHow) {
                    return true;
                }
                return false;
            }
            else if (this.isCatergoryFrequency()) {
                if (currentTweet.itemQs.dateEvent && currentTweet.itemQs.refTrainId && this.hasFrequencyValues()) {
                    return true;
                }
                return false;
            }
            else
            {
                if (currentTweet.txt
                    && (currentTweet.itemQs.refLocationId || currentTweet.itemQs.refTrackId)
                    && currentTweet.refItemCategoryId && this.isValidVehicle() && this.isValidNumber(currentTweet.itemQs.trackPosition)){
                    //&& (currentTweet.itemQs.refTrainId || currentTweet.itemQs.refWagonId)) {
                    return true;
                }
                return false;
            }
        }

        isCatergoryIeadsProposal() {if(this.$scope.storageService.currentTweet.refItemCategory.short_ === "IDEAS") return true; else return false;}

        isCatergoryComplaint() {if(this.$scope.storageService.currentTweet.refItemCategory.short_ === "COMPLAINT") return true; else return false;}

        isCatergoryFrequency() {if(this.$scope.storageService.currentTweet.refItemCategory.short_ === "FREQUENCY") return true; else return false;}
        
        gotoDetail(destination:string){
        	if(destination === 'app.category'){
        		this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId = null;
        	}
	       super.gotoDetail(destination);
        }

        isValidVehicle() {
            var refItemCategoryQs = this.network.metadataService.getCategoryQsById(this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId);
            if (refItemCategoryQs) {
                var categoryQsTree = this.network.metadataService.getCategoryQsTree(refItemCategoryQs);
                // Check if is main category "Fahrzeuge"
                if (categoryQsTree[0].id === 1
                    && (!this.$scope.storageService.currentTweet.itemQs.wagonsIds || this.$scope.storageService.currentTweet.itemQs.wagonsIds.length === 0)) {
                    return false;
                }
            }
            return true;
        }

        isValidNumber(nr: number) {
            if (!nr) {
                return true;
            }
            return isFinite(Number(nr));
        }

        getFrequencyValues(): string {
            var frequencyValues: string = "";
            if (this.$scope.storageService.currentTweet.itemQs.statistics) {
                for (var i = 0; i < this.$scope.storageService.currentTweet.itemQs.statistics.length; i++) {
                    if (frequencyValues) {
                        frequencyValues += ", ";
                    }
                    frequencyValues += this.$scope.storageService.currentTweet.itemQs.statistics[i].refStatistic.name + ": ";
                    frequencyValues += this.$scope.storageService.currentTweet.itemQs.statistics[i].quantity;
                }
            }
            return frequencyValues;
        }

        hasFrequencyValues(): boolean {
            if (!this.$scope.storageService.currentTweet.itemQs.statistics) {
                return false;
            }
            for (var i = 0; i < this.$scope.storageService.currentTweet.itemQs.statistics.length; i++) {
                if (this.$scope.storageService.currentTweet.itemQs.statistics[i].quantity > 0) {
                    return true;
                }
            }
            return false;
        }

        sendTweet() {
            if (this.$scope.storageService.currentTweet.refItemCategory.short_ === "IDEAS") {
                // Set fields for idea category
                this.$scope.storageService.currentTweet.itemQs.dateEvent = new Date().getTime().toString();
                this.$scope.storageService.currentTweet.txt = this.getItemTextFromTextIdeas();
            }
            super.sendTweet();
        }

        getItemTextFromTextIdeas(): string {
            var itemText: string = "";
            itemText = "WAS:\n";
            itemText += this.cleanText(this.$scope.storageService.currentTweet.textIdeaWhat) + "\n" + "\n";
            itemText += "WER:\n";
            itemText += this.cleanText(this.$scope.storageService.currentTweet.textIdeaWho) + "\n" + "\n";
            itemText += "WARUM:\n";
            itemText += this.cleanText(this.$scope.storageService.currentTweet.textIdeaWhy) + "\n" + "\n";
            itemText += "WIE:\n";
            itemText += this.cleanText(this.$scope.storageService.currentTweet.textIdeaHow);

            return itemText;
        }

        cleanText(text: string): string {
            // Replace double new lines
            text = text.replace(/\n\n/, "\n");
            text = text.replace(/\n\n\n/, "\n");
            // Replace new lines at the end
            for (var i = 0; i < 5; i++) {
                text = text.replace(/\n$/, "");
            }
            return text.trim();
        }
    }
}