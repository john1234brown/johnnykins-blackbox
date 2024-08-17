window.onload = (event) => {
document.getElementById('login').addEventListener('click', () => {
    window.location.href = '/login';
  });

  document.getElementById('logout').addEventListener('click', () => {
    window.location.href = '/logout';
  });

  document.getElementById('data-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { name: document.getElementById('name').value, address: document.getElementById('address').value };
    try {
      const response = await fetch('/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      if (response.ok) {
        alert('Form submitted successfully');
      } else {
        alert('Error submitting form');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form');
    }
  });

  async function checkAuth() {
    try {
      const response = await fetch('/profile', {
        mode: 'no-cors'
      });
      if (response.ok) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('logout').style.display = 'block';
        document.getElementById('data-form').style.display = 'block';
        document.getElementById('data-form2').style.display = 'block';
        setupLock();
      } else {
        document.getElementById('login').style.display = 'block';
        document.getElementById('logout').style.display = 'none';
        document.getElementById('data-form').style.display = 'none';
        document.getElementById('data-form2').style.display = 'none';
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  checkAuth();

  let booleanLock = false;
  function setupLock(){
    if (booleanLock === false){
    booleanLock = true;
    function checkForSessionTimeout() {
      fetch('/check-session-status', {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        console.log('Recieved Data:', JSON.stringify(data, null, 2));
        if (data.sessionTimedOut) {
          console.log('Timed out!');

          window.location.href = `/logout`;

          //window.location.reload();
        }
      })
      .catch(err => console.error('Error checking session status:', err));
    }
  
    // Check session status every 30 seconds
    setInterval(checkForSessionTimeout, 30 * 1000);
    }else{
      return;
    }
  }

  //console.log("page is fully loaded");
};