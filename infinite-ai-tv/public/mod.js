const events = new EventSource(
  `http://localhost:3000/moderation/events`,
  // { withCredentials: true }
);

const pending = new Set();

events.addEventListener('heartbeat', event => {
  const eventData = JSON.parse(event.data);

  if (!eventData || !eventData.prompts) {
    return;
  }

  const userPrompts = eventData.prompts;

  for (var user in userPrompts) {
    if (!pending.has(user)) {
      pending.add(user);
      addModItem(userPrompts[user]);
    }
  }
});

events.onmessage = message => {
  console.log(`aitv-moderation> ${message}`);
};

events.addEventListener('open', event => {
  console.log("aitv-moderation> event source client opened");
});

events.addEventListener('error', err => {
  console.error("aitv-moderation> an error occured connecting to event source");
});

function addModItem(userPrompt) {
  var ul = document.getElementById("modList");
  var li = document.createElement("li");
  li.setAttribute("id", userPrompt.user);
  li.classList.add("modItem");

  var contentNode = document.createElement("p");
  contentNode.textContent = `<< ${userPrompt.user} >> ${userPrompt.prompt}`;
  li.appendChild(contentNode);

  var continueBox = document.createElement("input");
  // continueBox.classList.add("myCheckbox");
  continueBox.setAttribute("type", "checkbox");

  var continueLabel = document.createElement("label");
  // continueLabel.classList.add("checkbox-label");
  continueLabel.textContent = "Continue?";
  continueLabel.appendChild(continueBox);
  li.appendChild(continueLabel);

  li.appendChild(document.createElement("br"));
  li.appendChild(document.createElement("br"));

  var approve = document.createElement("button");
  approve.classList.add("approve");
  approve.textContent = "Approve";
  approve.addEventListener("click", function () { // on approve clicked
    li.style.backgroundColor = "green";
    $.get(`http://localhost:3000/moderation/approve?user=${userPrompt.user}&continue=${continueBox.checked}`, () => {
      pending.delete(userPrompt.user);
      setTimeout(() => { li.remove(); }, 1000);
    });
  });
  li.appendChild(approve);

  var deny = document.createElement("button");
  deny.classList.add("deny");
  deny.textContent = "Deny";
  deny.addEventListener("click", function () { // on deny clicked
    li.style.backgroundColor = "red";
    $.get(`http://localhost:3000/moderation/deny?user=${userPrompt.user}`, () => {
      pending.delete(userPrompt.user);
      setTimeout(() => { li.remove(); }, 1000);
    });
  });
  li.appendChild(deny);

  ul.appendChild(li);
}
