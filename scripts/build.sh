# Clean all lib.* directories in packages/ and dist in root directory

echo "Cleaning all lib.* directories in packages/ and dist in root directory"

rm -rf packages/*/lib.*
rm -rf dist
