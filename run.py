import os, runpy, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))
runpy.run_module("azumod.main", run_name="__main__")
