from sqlalchemy import create_engine

DATABASE_URI = "mysql+pymysql://root:C0dePr0j$@10.18.104.22:3306/helpgccedu?connect_timeout=10"
engine = create_engine(DATABASE_URI)

try:
    connection = engine.connect()
    print("Connection successful!")
    connection.close()
except Exception as e:
    print(f"Error: {e}")