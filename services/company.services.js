const Company = require("../models/company");


const companyServices = {
    async getCompanyByCredentials(credentials){
        let company = null;
  
        if(credentials.email){
          company = await Company.findOne({email: credentials.email});
        }
        else if(credentials.phone){
            company = await Company.findOne({phone: {
                countryCode: credentials.phone.countryCode,
                number: parseInt(credentials.phone.number)
            }})
        }
  
        return company;
    },
    async getCompanies(query){
        // Destructure query parameters from request
        const { q, cvr, companyName, email, number } = query;

        // Initialize an empty filter object
        let filter = {};

        // Check for the "q" parameter - search across email, number, and name
        if (q) {
        filter = {
            $or: [
                { companyName: { $regex: q, $options: 'i' } }, // case-insensitive substring match for email
                { email: { $regex: q, $options: 'i' } },  // case-insensitive substring match for name
            ]
        };
        }

        // If "companyName" is provided, search by name
        if (companyName) {
        filter.companyName = new RegExp(companyName, 'i'); // case-insensitive search for name
        }

        // If "email" is provided, search by email
        if (email) {
        filter.email = new RegExp(email, 'i'); // case-insensitive search for email
        }

        // If "number" is provided, search by number
        if (number) {
            filter["phone.number"] = number; // exact match for number
        }

        if (cvr) {
            filter.cvr = cvr; // exact match for number
        }

        // Fetch users based on the filter
        const companies = await Company.find(filter);
        // Send back the results
        return companies;
    }
}

module.exports = companyServices