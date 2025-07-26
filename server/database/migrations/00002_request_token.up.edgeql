CREATE TYPE RequestToken {
  CREATE REQUIRED PROPERTY token -> str {
    CREATE CONSTRAINT exclusive;
  }
  CREATE REQUIRED PROPERTY kite_user_id -> str;
  CREATE REQUIRED PROPERTY created_at -> datetime {
    SET default := datetime_current();
  }
  CREATE PROPERTY expires_at -> datetime;
  CREATE PROPERTY used -> bool {
    SET default := false;
  }
};
