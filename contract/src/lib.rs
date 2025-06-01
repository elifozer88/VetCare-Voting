use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Map, Vec, Symbol,
};

// Veteriner bilgileri için struct
#[contracttype]
#[derive(Clone)]
pub struct Veteriner {
    pub id: u32,
    pub name: String,
    pub clinic: String,
    pub address: String,
    pub stellar_address: Address,
    pub vote_count: u32,
    pub total_donation: i128,
}

// Oy verme işlemi için struct
#[contracttype]
#[derive(Clone)]
pub struct Vote {
    pub voter: Address,
    pub veteriner_id: u32,
    pub amount: i128,
    pub timestamp: u64,
}

// Storage anahtarları
#[contracttype]
pub enum DataKey {
    Veterinerler,
    Oylar,
    Admin,
    VoterHistory(Address),
    TotalVotes,
}

#[contract]
pub struct VeterinerOylamaContract;

#[contractimpl]
impl VeterinerOylamaContract {
    
    /// Sözleşmeyi başlat
    pub fn initialize(env: Env, admin: Address) {
        let veterinerler: Map<u32, Veteriner> = Map::new(&env);
        let oylar: Vec<Vote> = Vec::new(&env);
        
        env.storage().instance().set(&DataKey::Veterinerler, &veterinerler);
        env.storage().instance().set(&DataKey::Oylar, &oylar);
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalVotes, &0u32);
    }

    /// Yeni veteriner ekle (sadece admin)
    pub fn add_veteriner(
        env: Env,
        admin: Address,
        id: u32,
        name: String,
        clinic: String,
        address: String,
        stellar_address: Address,
    ) -> Result<(), &'static str> {
        admin.require_auth();
        
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin)
            .ok_or("Admin not set")?;
        
        if admin != stored_admin {
            return Err("Unauthorized");
        }

        let mut veterinerler: Map<u32, Veteriner> = env.storage().instance()
            .get(&DataKey::Veterinerler)
            .unwrap_or(Map::new(&env));

        let veteriner = Veteriner {
            id,
            name,
            clinic,
            address,
            stellar_address,
            vote_count: 0,
            total_donation: 0,
        };

        veterinerler.set(id, veteriner);
        env.storage().instance().set(&DataKey::Veterinerler, &veterinerler);
        
        Ok(())
    }

    /// Oy ver ve bağış yap
    pub fn vote_and_donate(
        env: Env,
        voter: Address,
        veteriner_id: u32,
        amount: i128,
        token_address: Address,
    ) -> Result<(), &'static str> {
        voter.require_auth();

        if amount <= 0 {
            return Err("Amount must be positive");
        }

        // Veterineri bul
        let mut veterinerler: Map<u32, Veteriner> = env.storage().instance()
            .get(&DataKey::Veterinerler)
            .ok_or("Veterinerler not found")?;
        
        let mut veteriner = veterinerler.get(veteriner_id)
            .ok_or("Veteriner not found")?;

        // Kullanıcının daha önce oy verip vermediğini kontrol et
        let voter_history_key = DataKey::VoterHistory(voter.clone());
        let voter_history: Vec<u32> = env.storage().instance()
            .get(&voter_history_key)
            .unwrap_or(Vec::new(&env));

        // Aynı veterinere birden fazla oy vermeyi engelle
        for voted_id in voter_history.iter() {
            if voted_id == veteriner_id {
                return Err("Already voted for this veteriner");
            }
        }

        // Token transferi yap
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&voter, &veteriner.stellar_address, &amount);

        // Veteriner bilgilerini güncelle
        veteriner.vote_count += 1;
        veteriner.total_donation += amount;
        veterinerler.set(veteriner_id, veteriner);

        // Oy kaydını ekle
        let mut oylar: Vec<Vote> = env.storage().instance()
            .get(&DataKey::Oylar)
            .unwrap_or(Vec::new(&env));

        let vote = Vote {
            voter: voter.clone(),
            veteriner_id,
            amount,
            timestamp: env.ledger().timestamp(),
        };
        oylar.push_back(vote);

        // Voter history güncelle
        let mut updated_history = voter_history;
        updated_history.push_back(veteriner_id);

        // Storage'ı güncelle
        env.storage().instance().set(&DataKey::Veterinerler, &veterinerler);
        env.storage().instance().set(&DataKey::Oylar, &oylar);
        env.storage().instance().set(&voter_history_key, &updated_history);

        // Toplam oy sayısını güncelle
        let total_votes: u32 = env.storage().instance()
            .get(&DataKey::TotalVotes)
            .unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalVotes, &(total_votes + 1));

        Ok(())
    }

    /// Veteriner bilgilerini getir
    pub fn get_veteriner(env: Env, id: u32) -> Option<Veteriner> {
        let veterinerler: Map<u32, Veteriner> = env.storage().instance()
            .get(&DataKey::Veterinerler)?;
        veterinerler.get(id)
    }

    /// Tüm veterinerleri getir
    pub fn get_all_veterinerler(env: Env) -> Vec<Veteriner> {
        let veterinerler: Map<u32, Veteriner> = env.storage().instance()
            .get(&DataKey::Veterinerler)
            .unwrap_or(Map::new(&env));
        
        let mut result = Vec::new(&env);
        for (_, veteriner) in veterinerler.iter() {
            result.push_back(veteriner);
        }
        result
    }

    /// Kullanıcının oy geçmişini getir
    pub fn get_voter_history(env: Env, voter: Address) -> Vec<u32> {
        let voter_history_key = DataKey::VoterHistory(voter);
        env.storage().instance()
            .get(&voter_history_key)
            .unwrap_or(Vec::new(&env))
    }

    /// Toplam oy sayısını getir
    pub fn get_total_votes(env: Env) -> u32 {
        env.storage().instance()
            .get(&DataKey::TotalVotes)
            .unwrap_or(0)
    }

    /// En çok oy alan veterineri getir
    pub fn get_top_veteriner(env: Env) -> Option<Veteriner> {
        let veterinerler: Map<u32, Veteriner> = env.storage().instance()
            .get(&DataKey::Veterinerler)?;
        
        let mut top_veteriner: Option<Veteriner> = None;
        let mut max_votes = 0u32;

        for (_, veteriner) in veterinerler.iter() {
            if veteriner.vote_count > max_votes {
                max_votes = veteriner.vote_count;
                top_veteriner = Some(veteriner);
            }
        }
        
        top_veteriner
    }

    /// Belirli bir veterinerin toplam bağış miktarını getir
    pub fn get_veteriner_donations(env: Env, veteriner_id: u32) -> i128 {
        if let Some(veteriner) = Self::get_veteriner(env, veteriner_id) {
            veteriner.total_donation
        } else {
            0
        }
    }

    /// Admin adresini getir
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }
}

// Test modülü
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};

    #[test]
    fn test_initialize_and_add_veteriner() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, VeterinerOylamaContract);
        let client = VeterinerOylamaContractClient::new(&env, &contract_id);

        client.initialize(&admin);
        
        let result = client.add_veteriner(
            &admin,
            &1,
            &String::from_str(&env, "Dr. Test"),
            &String::from_str(&env, "Test Clinic"),
            &String::from_str(&env, "Test Address"),
            &Address::generate(&env),
        );
        
        assert!(result.is_ok());
    }

    #[test]
    fn test_vote_and_donate() {
        let env = Env::default();
        env.mock_all_auths();
        
        let admin = Address::generate(&env);
        let voter = Address::generate(&env);
        let vet_address = Address::generate(&env);
        let token_address = Address::generate(&env);
        
        let contract_id = env.register_contract(None, VeterinerOylamaContract);
        let client = VeterinerOylamaContractClient::new(&env, &contract_id);

        client.initialize(&admin);
        
        client.add_veteriner(
            &admin,
            &1,
            &String::from_str(&env, "Dr. Test"),
            &String::from_str(&env, "Test Clinic"),
            &String::from_str(&env, "Test Address"),
            &vet_address,
        );

        let result = client.vote_and_donate(&voter, &1, &1000000, &token_address);
        assert!(result.is_ok());

        let veteriner = client.get_veteriner(&1).unwrap();
        assert_eq!(veteriner.vote_count, 1);
        assert_eq!(veteriner.total_donation, 1000000);
    }
}