<button onClick={async () => {
  const subject = prompt("What subject should I learn?");
  if (subject) {
    const reply = await learnSubject(subject);
    setMessages([...messages, { kernel: reply }]);
  }
}}>Learn</button>