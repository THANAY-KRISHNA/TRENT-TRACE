import sys
import subprocess
import os

# Ensure PySpark uses the active virtual environment's python executable
os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

def check_python():
    print(f"[*] Python Version: {sys.version}")
    if sys.version_info < (3, 8):
        print("[!] Warning: PySpark recommends Python 3.8 or higher.")
        return False
    print("[+] Python version is compatible.")
    return True

def check_java():
    print("[*] Checking Java installation...")
    java_home = os.environ.get("JAVA_HOME")
    if java_home:
        print(f"[+] JAVA_HOME environment variable found: {java_home}")
    else:
        print("[-] JAVA_HOME environment variable not set. Spark may fail if java is not in PATH.")

    try:
        result = subprocess.run(["java", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        version_line = result.stderr.splitlines()[0] if result.stderr else "Unknown version"
        print(f"[+] Java version details: {version_line}")
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        print("\n[!] ERROR: Java JDK was not found in your system PATH.")
        print("    PySpark requires a Java JDK (version 8, 11, or 17) to run.")
        print("    Please install a Java JDK and ensure the 'java' executable is in your system PATH.")
        print("    You can download it from: https://adoptium.net/ or https://www.oracle.com/java/technologies/downloads/")
        return False

def check_pyspark():
    print("[*] Checking if PySpark is installed...")
    try:
        import pyspark
        from pyspark.sql import SparkSession
        print(f"[+] PySpark package import successful (version: {pyspark.__version__}).")
        
        print("[*] Attempting to initialize local SparkSession...")
        # Configure local master to run without Hadoop binaries warnings if possible, or just build
        spark = SparkSession.builder \
            .appName("SentiraEnvCheck") \
            .master("local[*]") \
            .config("spark.driver.bindAddress", "127.0.0.1") \
            .getOrCreate()
            
        print("[+] SparkSession successfully initialized locally!")
        
        # Test a simple DataFrame operation
        df = spark.createDataFrame([("test", 1)], ["name", "value"])
        df.collect()
        print("[+] Basic Spark DataFrame operation succeeded!")
        
        spark.stop()
        return True
    except ImportError:
        print("[-] PySpark package is not installed in the current environment.")
        return False
    except Exception as e:
        print(f"\n[!] ERROR: PySpark imported successfully, but failed to initialize:")
        print(f"    {str(e)}")
        print("\n    If you are on Windows, this is often caused by:")
        print("    1. Java not being installed/configured properly.")
        print("    2. Missing winutils.exe (though local Spark 3.x should run with warnings, it can fail in some strict environments).")
        return False

def main():
    print("=" * 60)
    print("             SENTIRA ENVIRONMENT VALIDATION CHECK")
    print("=" * 60)
    
    py_ok = check_python()
    print("-" * 60)
    java_ok = check_java()
    print("-" * 60)
    spark_ok = check_pyspark()
    
    print("=" * 60)
    if py_ok and java_ok and spark_ok:
        print("[SUCCESS] Environment is fully configured and ready for Spark!")
    elif not java_ok:
        print("[FAILURE] Environment check failed due to missing Java. Please install Java JDK.")
    elif not spark_ok:
        print("[FAILURE] PySpark failed to run. Check the errors above.")
    else:
        print("[WARNING] PySpark is not installed yet. Create the venv and install requirements.")
    print("=" * 60)

if __name__ == "__main__":
    main()
