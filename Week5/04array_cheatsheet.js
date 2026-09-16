const colors = ["red", "green", "blue", "yellow", "purple"];
colors[0] = "orange";      
colors.length;
console.log(colors); 
console.log(colors.length);

const person = {
    first: "John",
    last: "Doe",
    fullName() {
        return `${this.first} ${this.last}`;
    }
};
person.fullName()
const func = person.fullName;
func(); 