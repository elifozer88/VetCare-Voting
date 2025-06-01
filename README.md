![image](https://github.com/user-attachments/assets/404d7eba-b3b3-4ea1-82ec-7082a39cabce)

<p align="center">
  <img src="https://raw.githubusercontent.com/elifozer88/VetCare-Voting/main/frontend/public/vercel.svg" width="120" alt="VetCare Logo" />
</p>

<h1 align="center">🐾 VetCare Voting DApp</h1>
<p align="center">A decentralized voting & donation platform for veterinarians using Stellar & Soroban</p>

---


## 🚀 Features

- 🗳️ Vote for veterinarians based on satisfaction  
- 💸 Automatically send 10 XLM to the selected vet with every vote  
- 🔐 Connect securely using the **Freighter Wallet**  
- ⚙️ Smart contract logic powered by **Soroban (Rust)**  
- 🖥️ Clean and modern **Next.js frontend** with Tailwind CSS  
- 📊 Live vote and donation statistics  

---

## 📂 Project Structure

```bash
/vetcare-voting/
├── contract/           # Rust-based Soroban smart contract
├── frontend/           # Next.js frontend application
├── tailwind.config.js  # Tailwind configuration
├── README.md           # This documentation
🛠️ Installation
1️⃣ Clone the repository

bash

git clone https://github.com/elifozer88/VetCare-Voting.git
cd VetCare-Voting
2️⃣ Install frontend dependencies

bash

cd frontend
npm install
3️⃣ Start the development server

bash

npm run dev
4️⃣ Build the smart contract

bash

cd ../contract
cargo build --target wasm32-unknown-unknown --release
💡 Requires Soroban CLI:
cargo install --locked soroban-cli --features opt

⚙️ Usage
Visit the app in your browser.

Click "Connect Wallet" (Freighter) to authenticate.

Choose a veterinarian and vote.

10 XLM is automatically donated via Soroban smart contract.

🧠 Smart Contract Deployment (Testnet)
bash

soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vet_voting_contract.wasm \
  --source alice \
  --network testnet
Initialize Contract
bash

soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --token_contract <TOKEN_CONTRACT_ID>
Add Veterinarian
bash

soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- add_veterinarian \
  --id 1 \
  --name "Dr. Ayşe Kaya" \
  --clinic "Sevgi Vet Clinic" \
  --location "Izmir, Turkey" \
  --specialty "Small Animal Medicine" \
  --vet_address <VET_PUBLIC_KEY>
📸 Screenshots
Add screenshots in /frontend/public/ and link here
Example:

md

![App Screenshot](./frontend/public/vote-screenshot.png)
📄 License
This project is licensed under the MIT License.

🤝 Contributing
We welcome contributions!

Fork the project

Create a feature branch

Commit your changes

Open a pull request

Or feel free to open GitHub Issues for suggestions and bug reports.

🔗 Useful Links
🌐 Stellar Developer Docs

📘 Soroban Documentation

💼 Freighter Wallet
