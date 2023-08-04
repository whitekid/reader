# Readability viewer

[Live Example](https://reader.woosum.net/read/https://medium.com/gsuite/how-to-design-your-time-cf1a97a0d050)

## bookmarklet

    javascript: (() => { location.href="https://reader.woosum.net/read/" + location.href ; })();

## Setup

setup potgresql database

    CREATE USER reader_user WITH PASSWORD 'reader_pass';
    CREATE DATABASE reader_test OWNER reader_user;

migrate with pgloader

    pgloader reader.db pgsql://reader_user:reader_pass@localhost/reader_test
