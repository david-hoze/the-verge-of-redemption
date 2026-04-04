import System
import System.File
import System.Directory
import Data.String
import Data.List

outDir : String
outDir = "C:/msys64/home/natanh/docs/the-verge-of-redemption"

tmp : String
tmp = "C:/msys64/tmp/substack-dl"

-- Run a command via bash
run : String -> IO Int
run cmd = do
  Right _ <- writeFile (tmp ++ "/cmd.sh") cmd
    | Left _ => pure 1
  system ("bash " ++ tmp ++ "/cmd.sh")

-------------------------------------------------------------------
-- JSON helpers: extract a string value right after "key":
-- Must properly skip over JSON string values to avoid matching
-- inside body_html or other large string fields
-------------------------------------------------------------------

-- Skip a JSON string value (past closing quote, handling escapes)
skipJsonString : List Char -> List Char
skipJsonString [] = []
skipJsonString ('\\' :: _ :: rest) = skipJsonString rest
skipJsonString ('"' :: rest) = rest
skipJsonString (_ :: rest) = skipJsonString rest

-- Get a JSON string value (between quotes, handling escapes)
readJsonString : List Char -> (String, List Char)
readJsonString cs = let (val, rest) = go cs in (pack val, rest)
  where
    go : List Char -> (List Char, List Char)
    go [] = ([], [])
    go ('\\' :: '"' :: r) = let (v, r') = go r in ('"' :: v, r')
    go ('\\' :: 'n' :: r) = let (v, r') = go r in ('\n' :: v, r')
    go ('\\' :: '\\' :: r) = let (v, r') = go r in ('\\' :: v, r')
    go ('\\' :: '/' :: r) = let (v, r') = go r in ('/' :: v, r')
    go ('\\' :: 'u' :: a :: b :: c :: d :: r) = let (v, r') = go r in ('?' :: v, r')  -- unicode escape placeholder
    go ('"' :: r) = ([], r)
    go (c :: r) = let (v, r') = go r in (c :: v, r')

-- Skip whitespace
skipWs : List Char -> List Char
skipWs (' ' :: r) = skipWs r
skipWs ('\n' :: r) = skipWs r
skipWs ('\r' :: r) = skipWs r
skipWs ('\t' :: r) = skipWs r
skipWs r = r

-- Find a key in current JSON object level and return its string value
-- This properly skips nested strings so we don't match keys inside values
findKeyValue : String -> List Char -> Maybe (String, List Char)
findKeyValue key cs = go (unpack key) cs
  where
    matchKey : List Char -> List Char -> Maybe (List Char)
    matchKey [] ('"' :: rest) = Just rest  -- key must end with closing quote
    matchKey [] _ = Nothing
    matchKey (k :: ks) (c :: rest) = if k == c then matchKey ks rest else Nothing
    matchKey _ [] = Nothing

    go : List Char -> List Char -> Maybe (String, List Char)
    go _ [] = Nothing
    go needle ('"' :: rest) =
      -- We hit a quoted string. Check if it matches our key
      case matchKey needle rest of
        Just afterKey =>
          -- Check if next non-ws char is ':'
          let afterColon = skipWs afterKey in
          case afterColon of
            (':' :: afterC) =>
              let afterVal = skipWs afterC in
              case afterVal of
                ('"' :: valStart) => Just (readJsonString valStart)
                _ => go needle rest  -- value isn't a string
            _ => go needle rest  -- not a key:value pair
        Nothing =>
          -- Not our key - skip this string value entirely
          go needle (skipJsonString rest)
    go needle (_ :: rest) = go needle rest

-------------------------------------------------------------------
-- Extract all slugs from archive JSON
-- Finds every "slug":"value" properly
-------------------------------------------------------------------
extractSlugs : String -> List String
extractSlugs json = go (unpack json)
  where
    go : List Char -> List String
    go [] = []
    go ('"' :: 's' :: 'l' :: 'u' :: 'g' :: '"' :: rest) =
      let rest2 = skipWs rest in
      case rest2 of
        (':' :: rest3) =>
          let rest4 = skipWs rest3 in
          case rest4 of
            ('"' :: rest5) =>
              let (slug, rest6) = readJsonString rest5
              in slug :: go rest6
            _ => go rest4
        _ => go rest2
    -- Skip any other quoted string to avoid matching inside values
    go ('"' :: rest) = go (skipJsonString rest)
    go (_ :: rest) = go rest

-------------------------------------------------------------------
-- HTML to Markdown converter
-------------------------------------------------------------------
htmlToMd : String -> String
htmlToMd = pack . go . unpack
  where
    skipTag : List Char -> List Char
    skipTag [] = []
    skipTag ('>' :: rest) = rest
    skipTag (_ :: rest) = skipTag rest

    readUntil : List Char -> List Char -> (List Char, List Char)
    readUntil close [] = ([], [])
    readUntil close hay =
      if isPrefixOf close hay then ([], drop (length close) hay)
      else case hay of
        (c :: rest) => let (inner, r) = readUntil close rest in (c :: inner, r)
        [] => ([], [])

    extractHref : List Char -> (List Char, List Char)
    extractHref cs = go2 cs
      where
        go2 : List Char -> (List Char, List Char)
        go2 [] = ([], [])
        go2 ('>' :: rest) = ([], rest)
        go2 ('h' :: 'r' :: 'e' :: 'f' :: '=' :: '"' :: rest) =
          let (url, after) = readUntil ['"'] rest in (url, skipTag after)
        go2 ('h' :: 'r' :: 'e' :: 'f' :: '=' :: '\'' :: rest) =
          let (url, after) = readUntil ['\''] rest in (url, skipTag after)
        go2 (_ :: rest) = go2 rest

    go : List Char -> List Char
    go [] = []
    go ('<' :: 'h' :: n :: rest) =
      if n >= '1' && n <= '6'
        then let after = skipTag rest
                 (inner, rest2) = readUntil (unpack ("</h" ++ singleton n ++ ">")) after
                 hashes = replicate (cast (ord n - ord '0')) '#'
             in '\n' :: (hashes ++ (' ' :: go inner ++ ('\n' :: '\n' :: go rest2)))
        else '<' :: 'h' :: n :: go rest
    go ('<' :: 's' :: 't' :: 'r' :: 'o' :: 'n' :: 'g' :: rest) =
      let after = skipTag rest
          (inner, rest2) = readUntil (unpack "</strong>") after
      in '*' :: '*' :: (go inner ++ ('*' :: '*' :: go rest2))
    go ('<' :: 'e' :: 'm' :: rest) =
      let after = skipTag rest
          (inner, rest2) = readUntil (unpack "</em>") after
      in '*' :: (go inner ++ ('*' :: go rest2))
    go ('<' :: 'a' :: ' ' :: rest) =
      let (href, after) = extractHref rest
          (inner, rest2) = readUntil (unpack "</a>") after
      in '[' :: (go inner ++ (']' :: '(' :: (href ++ (')' :: go rest2))))
    go ('<' :: 'b' :: 'r' :: rest) = '\n' :: go (skipTag rest)
    go ('<' :: '/' :: 'p' :: '>' :: rest) = '\n' :: '\n' :: go rest
    go ('<' :: 'l' :: 'i' :: rest) =
      let after = skipTag rest
          (inner, rest2) = readUntil (unpack "</li>") after
      in '-' :: ' ' :: (go inner ++ ('\n' :: go rest2))
    go ('<' :: 'b' :: 'l' :: 'o' :: 'c' :: 'k' :: 'q' :: rest) =
      let after = skipTag rest
          (inner, rest2) = readUntil (unpack "</blockquote>") after
      in '\n' :: '>' :: ' ' :: (go inner ++ ('\n' :: '\n' :: go rest2))
    go ('<' :: 'h' :: 'r' :: rest) = '\n' :: '\n' :: '-' :: '-' :: '-' :: '\n' :: '\n' :: go (skipTag rest)
    go ('<' :: rest) = go (skipTag rest)
    go ('&' :: 'a' :: 'm' :: 'p' :: ';' :: rest) = '&' :: go rest
    go ('&' :: 'l' :: 't' :: ';' :: rest) = '<' :: go rest
    go ('&' :: 'g' :: 't' :: ';' :: rest) = '>' :: go rest
    go ('&' :: 'q' :: 'u' :: 'o' :: 't' :: ';' :: rest) = '"' :: go rest
    go ('&' :: '#' :: 'x' :: '2' :: '7' :: ';' :: rest) = '\'' :: go rest
    go ('&' :: 'n' :: 'b' :: 's' :: 'p' :: ';' :: rest) = ' ' :: go rest
    go ('&' :: '#' :: '8' :: '2' :: '1' :: '7' :: ';' :: rest) = '-' :: go rest
    go ('&' :: '#' :: '8' :: '2' :: '1' :: '6' :: ';' :: rest) = '-' :: go rest
    go ('&' :: '#' :: '8' :: '2' :: '2' :: '0' :: ';' :: rest) = '\'' :: go rest
    go ('&' :: '#' :: '8' :: '2' :: '2' :: '1' :: ';' :: rest) = '\'' :: go rest
    go ('&' :: '#' :: rest) =
      -- skip numeric entity
      let afterSemicolon = dropWhile (/= ';') rest in
      case afterSemicolon of
        (';' :: r) => go r
        _ => go rest
    go (c :: rest) = c :: go rest

-------------------------------------------------------------------
-- Check if slug.md already exists
-------------------------------------------------------------------
isMissing : String -> IO Bool
isMissing slug = do
  Right f <- openFile (outDir ++ "/" ++ slug ++ ".md") Read
    | Left _ => pure True
  closeFile f
  pure False

-------------------------------------------------------------------
-- Download one article
-------------------------------------------------------------------
download : String -> IO ()
download slug = do
  putStrLn ("  -> " ++ slug)
  let json = tmp ++ "/" ++ slug ++ ".json"
  let out  = outDir ++ "/" ++ slug ++ ".md"
  0 <- run ("curl -s 'https://davidhoze.substack.com/api/v1/posts/" ++ slug ++ "' -o '" ++ json ++ "'")
    | _ => do putStrLn "     FAILED to fetch"; pure ()
  Right rawJson <- readFile json
    | Left _ => do putStrLn "     FAILED to read json"; pure ()
  -- Extract title and body from post JSON
  let title = case findKeyValue "title" (unpack rawJson) of
                Just (t, _) => t
                Nothing => slug
  let body = case findKeyValue "body_html" (unpack rawJson) of
                Just (b, _) => b
                Nothing => ""
  let md = htmlToMd body
  Right _ <- writeFile out ("# " ++ title ++ "\n\n" ++ md)
    | Left _ => do putStrLn "     FAILED to write"; pure ()
  putStrLn "     saved"

-------------------------------------------------------------------
-- Fetch all slugs with pagination
-------------------------------------------------------------------
fetchAllSlugs : Nat -> List String -> IO (List String)
fetchAllSlugs offset acc = do
  let url = "https://davidhoze.substack.com/api/v1/archive?sort=new&limit=25&offset=" ++ show offset
  0 <- run ("curl -s '" ++ url ++ "' -o '" ++ tmp ++ "/page.json'")
    | _ => do putStrLn "  failed to fetch page"; pure acc
  Right pageJson <- readFile (tmp ++ "/page.json")
    | Left _ => pure acc
  let slugs = extractSlugs pageJson
  case slugs of
    [] => pure acc
    _  => fetchAllSlugs (offset + length slugs) (acc ++ slugs)

filterMissing : List String -> IO (List String)
filterMissing [] = pure []
filterMissing (s :: xs) = do
  miss <- isMissing s
  rest <- filterMissing xs
  pure (if miss then s :: rest else rest)

-------------------------------------------------------------------
main : IO ()
main = do
  _ <- createDir tmp
  putStrLn "Fetching index..."
  slugs <- fetchAllSlugs 0 []
  putStrLn (show (length slugs) ++ " articles found")
  missing <- filterMissing slugs
  putStrLn (show (length missing) ++ " missing")
  traverse_ download missing
  putStrLn "Done."
