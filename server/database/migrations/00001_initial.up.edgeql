CREATE TYPE User {
  CREATE REQUIRED PROPERTY user_id -> str {
    CREATE CONSTRAINT exclusive;
  }
  CREATE REQUIRED PROPERTY kite_user_id -> str;
  CREATE REQUIRED PROPERTY access_token -> str;
  CREATE PROPERTY public_token -> str;
  CREATE PROPERTY refresh_token -> str;
  CREATE PROPERTY token_expiry -> datetime;
  CREATE REQUIRED PROPERTY created_at -> datetime {
    SET default := datetime_current();
  }
  CREATE PROPERTY last_login -> datetime;
  CREATE PROPERTY profile_data -> json;
};

CREATE TYPE Holding {
  CREATE REQUIRED PROPERTY user_id -> str;
  CREATE REQUIRED PROPERTY instrument_token -> int64;
  CREATE REQUIRED PROPERTY exchange -> str;
  CREATE REQUIRED PROPERTY tradingsymbol -> str;
  CREATE REQUIRED PROPERTY quantity -> int32;
  CREATE REQUIRED PROPERTY average_price -> decimal;
  CREATE PROPERTY last_updated -> datetime {
    SET default := datetime_current();
  }
};

CREATE TYPE Session {
  CREATE REQUIRED PROPERTY session_id -> str {
    CREATE CONSTRAINT exclusive;
  }
  CREATE REQUIRED PROPERTY user_id -> str;
  CREATE REQUIRED PROPERTY kite_user_id -> str;
  CREATE REQUIRED PROPERTY created_at -> datetime {
    SET default := datetime_current();
  }
  CREATE PROPERTY expires_at -> datetime;
};
