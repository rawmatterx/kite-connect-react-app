module default {
  type User {
    required property user_id -> str {
      constraint exclusive;
    }
    required property kite_user_id -> str;
    required property access_token -> str;
    property public_token -> str;
    property refresh_token -> str;
    property token_expiry -> datetime;
    required property created_at -> datetime {
      default := datetime_current();
    }
    property last_login -> datetime;
    property profile_data -> json;
  }

  type Holding {
    required property user_id -> str;
    required property instrument_token -> int64;
    required property exchange -> str;
    required property tradingsymbol -> str;
    required property quantity -> int32;
    required property average_price -> decimal;
    property last_updated -> datetime {
      default := datetime_current();
    }
  }

  type Session {
    required property session_id -> str {
      constraint exclusive;
    }
    required property user_id -> str;
    required property kite_user_id -> str;
    required property created_at -> datetime {
      default := datetime_current();
    }
    property expires_at -> datetime;
  }
}
