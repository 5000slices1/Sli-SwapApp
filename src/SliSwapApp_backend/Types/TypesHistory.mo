import Time "mo:base/Time";

module {

    public type UsedSubAccount = {
        subAccount:Blob;
        createdAt:Time.Time;
    };
};