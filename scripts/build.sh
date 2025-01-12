SHOULD_TEST=false

# Check if there is a test flag

while [[ "$#" -gt 0 ]]; do
    case $1 in
    --test)
        SHOULD_TEST=true
        ;;
    *)
        echo "Invalid option: $1" >&2
        ;;
    esac
    shift
done

echo $SHOULD_TEST

# Check test flag and run tests if needed

if [ "$SHOULD_TEST" = true ]; then
    echo "🧪 Running tests"
    npm run test
fi

# Clean all lib.* directories in packages/*/ and dist in root directory

echo "🧹 Cleaning all previous distribution"

rm -rf packages/*/lib.*
rm -rf dist

# Create lib.* directories in packages/* with file package.json such
# if directory is `lib.esm` then file package.json will be created with
# content `{"type": "module"}`

echo "👷 Building project distribution"

for dir in packages/*; do
    if [ -d "$dir" ]; then
        echo " => Building $dir"

        mkdir -p $dir/lib.esm
        echo '{"type": "module"}' >$dir/lib.esm/package.json

        mkdir -p $dir/lib.cjs
        echo '{"type": "commonjs"}' >$dir/lib.cjs/package.json

    fi
done

# Run typescript build

tsc -b

echo "\n\n✅ Project distribution built successfully 🎉"
