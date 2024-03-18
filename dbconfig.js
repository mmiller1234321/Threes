// PostgreSQL database connection configuration
const dbConfig = {
    user: 'results_db_sjfx_user',
    host: 'dpg-cnqc81q1hbls73f7l6sg-a.ohio-postgres.render.com',
    database: 'results_db_sjfx',
    password: '4V8RryOH4CFAFsFTeB1sCoUCYLluNFVV',
    port: 5432,
    ssl: {
      rejectUnauthorized: false // This is used to accept self-signed certificates, you should provide the appropriate SSL configuration for your environment
    }
  };
  
  module.exports = dbConfig;