const themes = [
    {bg:"#ffffff", text:"#4400ffff", btn:"#00ff15ff"},
    {bg:"#000000", text:"#ffffffff", btn:"#ff0000ff"}
];

let currentTheme = 0;
const btn = document.getElementById("theme-btn");
btn.addEventListener("click", () =>{
    currentTheme = (currentTheme + 1) % themes.length;
const theme = themes[currentTheme];
document.body.style.backgroundColor = theme.bg;
document.body.style.color = theme.text;
btn.style.backgroundColor = theme.btn;
});