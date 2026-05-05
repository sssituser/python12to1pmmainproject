import pymysql
pymysql.install_as_MySQLdb()
# Set version to satisfy Django 6.0 requirement
import MySQLdb as _MySQLdb
_MySQLdb.__version__ = "2.2.4"
_MySQLdb.version_info = (2, 2, 4, "final", 0)