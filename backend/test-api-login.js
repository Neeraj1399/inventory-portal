// Uses global fetch (Node 18+)

const testLogin = async () => {
  const credentials = {
    email: "neerajaravind13@gmail.com",
    password: "Admin@123"
  };

  try {
    console.log(`Attempting login at http://localhost:5000/api/auth/login with ${credentials.email}...`);
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));

    if (response.status === 200 && data.status === "success") {
      console.log("✅ LOGIN SUCCESSFUL ON LOCAL BACKEND");
    } else {
      console.log("❌ LOGIN FAILED ON LOCAL BACKEND");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
};

testLogin();
