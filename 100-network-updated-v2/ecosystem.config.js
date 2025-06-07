module.exports = {
  apps : [{
    name   : "my-nextjs-app-dev-v2",
    script : "pnpm",
    args   : "dev",
    cwd    : "/root/100-network-updated-v2",
    env_production : {
       NODE_ENV: "production",
       POSTGRES_URL: "postgresql://flexbone_username:flexbone_password@5.189.179.61:3001/flexbone_db",
       JWT_SECRET: "e5ab1867ca63c0b8b1827d0529db0bf6646bf33e63e5e74537077d55cf061e793fc2af2efb55940c146d384bd792da771b20856cc64df76f5cd10aa061b90684f777aee446b1ce97a92718d4d4afa0b0d8f57aa9327d59f8638bbdde5a0144f0993cc8d07e59b15bfce69b14e227da0d224068c07502f643684630d09226001b9b096a23285cd04befc3df2a4b730bf9f6859edecfb2a8a80bdd9f4924c3fec504cf3f9295d003c9a418154a0aac82d16ef37161df13aeff1fd1c5f8cf50d65f2279640752d5d67278db8c95a511e8dd015fb1360b98094bef51c5fb612b822529213509e45400887e0beadd99f2d20eceb77329ca7a567d5348a12f4e497816"
    },
    env_development: {
       NODE_ENV: "development",
       POSTGRES_URL: "postgresql://flexbone_username:flexbone_password@5.189.179.61:3001/flexbone_db",
       JWT_SECRET: "acddceb76f9e6d6c01b53fb5757df3d6763f6da6da7bdf521c8638a2eea6cebc26348e28833dddd9abc25607b5d08878988a7d9beb0a13a7c8cec86ff5c18e2f7a73ae81f711aca2255dfeda986cc8915cbf7e5a5e9605cdbed2bd633c599b4d1e0a059d194cf50b6c0c05b90680191cb7cfeebe22fef8d826e1d6e3bd9a7248a40e84587e330c090a70f2495d2faa3e4fc420be8538b572e50fd81b3d090cc1cf750493c64be5dd5b9b2a20ab2093b51191738041e2705a3d77b23dff224e2827e27ee950b1b60636b092bd226aea637d6da39abd938c41a6e534ebd94f582f6c78710dc508d36167c9f878cb8d8c1d67b4abcdecd8a88cdbf39d3b30b941c4"
    }
  }]
};
