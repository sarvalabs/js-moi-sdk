# Clean all lib.* directories in packages/*/ and dist in root directory

echo "Cleaning all lib.* directories in packages/ and dist in root directory"

rm -rf packages/*/lib.*
rm -rf dist

# Create lib.* directories in packages/* with file package.json such
# if directory is `lib.esm` then file package.json will be created with
# content `{"type": "module"}`

echo "Building project distribution"

for dir in packages/*; do
    if [ -d "$dir" ]; then
        echo "Building $dir"

        mkdir -p $dir/lib.esm
        echo '{"type": "module"}' >$dir/lib.esm/package.json

        mkdir -p $dir/lib.cjs
        echo '{"type": "commonjs"}' >$dir/lib.cjs/package.json

    fi
done

# Run typescript build

tsc -b

echo "Project distribution built successfully 🎉"
